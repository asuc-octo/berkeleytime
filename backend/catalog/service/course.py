"""Course Service."""

import logging

from django.core.cache import cache

from catalog.mapper import course_mapper
from catalog.resource import sis_course_resource
from catalog.models import Course, Section
from grades.models import Grade
from grades.utils import add_up_grades, gpa_to_letter_grade


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class CourseService:
    _courses_with_enrollment_cache_name = "enrollment__courses"

    def update(self, page_number=0, page_size=100):
        """Update courses starting from an SIS index."""
        unknown_departments = set()
        for course_response in sis_course_resource.get(page_number, page_size):
            course_dict = course_mapper.map(course_response, unknown_departments=unknown_departments)

            try:
                course_obj, created = Course.objects.update_or_create(
                    abbreviation=course_dict['abbreviation'],
                    course_number=course_dict['course_number'],
                    defaults=course_dict,
                )
                if created:
                    logger.info({
                        'message': 'Created new course object',
                        'course': course_obj,
                    })
            except:
                logger.exception({
                    'message': 'Exception encountered while updating/creating course',
                    'course_dict': course_dict,
                })

        if unknown_departments:
            logger.info({
                'message': 'Found unknown departments/abbreviations',
                'unknown': unknown_departments,
            })


    def invalidate_courses_with_enrollment_cache(self):
        """Invalidate the cache we use to store data of courses that have enrollment."""
        cache.delete(self._courses_with_enrollment_cache_name)


    def update_derived_enrollment_fields(self, course_id, semester, year):
        """Update enrollment summary fields with the latest enrollment."""
        primary_sections = Section.objects.filter(
            course_id=course_id, semester=semester, year=year, is_primary=True, disabled=False
        )

        if not primary_sections:
            course = Course.objects.get(id=course_id)
            for field in Course._derived_enrollment_fields:
                default = Course._meta.get_field(field).get_default()
                setattr(course, field, default)
            return

        def sum_fields(sections, field_name):
            """Sum over section.field_name iff section.field is not None."""
            values = [getattr(s, field_name) for s in sections if getattr(s, field_name) is not None]  # noqa
            rtn = sum(values) if values else -1  # -1 means no data
            return rtn

        # Get the some of each value over all primary sections
        enrolled = sum_fields(primary_sections, 'enrolled')
        enrolled_max = sum_fields(primary_sections, 'enrolled_max')

        # Exit if enrolled_max is -1 (no data)
        # OR enrolled is -1 (no data), it's ok if enrolled is 0
        if enrolled_max == -1 or enrolled == -1:
            return

        course = Course.objects.get(id=course_id)

        course.enrolled = enrolled
        course.enrolled_max = enrolled_max
        course.waitlisted = sum_fields(primary_sections, 'waitlisted')

        # Do not want to divide by 0!
        if course.enrolled_max != 0:
            course.enrolled_percentage = float(course.enrolled) / float(course.enrolled_max)
            if course.enrolled_percentage > 1:
                course.enrolled_percentage = 1.0
        else:
            # Default percentage if enrolled_max is -1, most likely bug in the API
            # This will ensure that the front won't populate the field
            course.enrolled_percentage = -1

        # Take the max in case SIS fucks up and returns negative numbers
        course.open_seats = max(course.enrolled_max - course.enrolled, 0)
        course.save()


    def update_derived_grade_fields(self, course_id):
        """Take a course_id and recalculate its derived grade fields."""
        grades = Grade.objects.filter(course_id=course_id)
        if not grades:
            return

        # Counter for letter grades weighted by their GPA value (e.g. 100 * B+ 3.3)  # noqa
        weighted_letter_grade_counter, total = add_up_grades(grades)

        if not total:
            return

        weighted_total = float(sum(weighted_letter_grade_counter.values()))
        course = Course.objects.get(pk=course_id)
        course.grade_average = weighted_total / total
        course.letter_average = gpa_to_letter_grade(weighted_total / total)
        course.save()


course_service = CourseService()