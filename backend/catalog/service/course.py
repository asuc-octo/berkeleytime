"""Course Service."""
import sys

from django.core.cache import cache
from django.db.models import Sum, Q


from berkeleytime.settings import (
    CURRENT_SEMESTER,
    CURRENT_YEAR,
)
from catalog.mapper import course_mapper
from catalog.resource import sis_course_resource
from catalog.models import Course, Section
from grades.models import Grade
from grades.utils import add_up_grades, gpa_to_letter_grade

class CourseService:
    _courses_with_enrollment_cache_name = "enrollment__courses"

    def update(self, page_number=0, page_size=100):
        """Update courses starting from an SIS index."""
        unknown_departments = set()
        courses = []
        for course_response in sis_course_resource.get(page_number, page_size):
            course_dict = course_mapper.map(
                course_response,
                unknown_departments=unknown_departments
            )

            course, created = self.update_or_create_from_dict(course_dict)
            if course is not None:
                courses.append(course)

        for c in courses:
            # Update derived grade fields.
            # Done strictly after updating course info for cross listed grades
            self._update_derived_grade_fields(c)

        if unknown_departments:
            print('Found unknown departments/abbreviations:', unknown_departments, file=sys.stderr)


    def update_or_create_from_dict(self, course_dict):
        try:
            cross_listing_courses = self._course_names_to_objects(course_dict['cross_listing'])
            del course_dict['cross_listing']

            course_obj, created = Course.objects.update_or_create(
                abbreviation=course_dict['abbreviation'],
                course_number=course_dict['course_number'],
                defaults=course_dict,
            )

            cross_listing_courses.append(course_obj)
            for cross_course in cross_listing_courses:
                other_courses_to_link = []
                for other_course in cross_listing_courses:
                    if other_course.id != cross_course.id:
                        other_courses_to_link.append(other_course)
                cross_course.cross_listing.set(other_courses_to_link)
                cross_course.save()

            print('Updated/created new course object', course_obj, created)
            return course_obj, created
        except Exception as e:
            print('Exception encountered while updating/creating course', course_dict, file=sys.stderr)
            return None, False


    def _course_names_to_objects(self, names):
        """Used for converting cross listed courses to their objects for the ManyToManyField"""
        courses_list = []
        for n in names:
            try:
                abbreviation, course_number = n.rsplit(' ', 1)
                course = Course.objects.get(abbreviation=abbreviation, course_number=course_number)
                courses_list.append(course)

            # likely just not created yet, and when that course is created, it can just add its
            # cross listed courses and it will be added to this one because the field is symmetrical
            except Course.DoesNotExist:
                pass

            except Exception as e:
                print('Exception encountered while finding course from name', n, e, file=sys.stderr)
        return courses_list


    def _update_derived_grade_fields(self, course):
        """Take a course object and recalculate its derived grade fields."""
        grades = Grade.objects.filter(
            Q(course=course) | Q(course__cross_listing=course)
        ).distinct('id')
        weighted_letter_grade_counter, total = add_up_grades(grades)

        if total == 0:
            return

        weighted_total = float(sum(weighted_letter_grade_counter.values()))
        course.grade_average = weighted_total / total
        course.letter_average = gpa_to_letter_grade(course.grade_average)
        course.save()


    def _update_derived_enrollment_fields(self, course):
        """Update enrollment summary fields with the latest enrollment."""
        primary_sections = Section.objects.filter(
            course=course, semester=CURRENT_SEMESTER, year=CURRENT_YEAR,
            is_primary=True, disabled=False,
        )

        # If no active primary sections exist, reset enrollment fields to default (-1)
        if not primary_sections.exists():
            for field in Course._derived_enrollment_fields:
                setattr(course, field, Course._meta.get_field(field).get_default())
            course.save()
            return

        aggregates = primary_sections.filter(
            enrolled__gte=0, enrolled_max__gte=0, waitlisted__gte=0,
        ).aggregate(
            Sum('enrolled'), Sum('enrolled_max'), Sum('waitlisted'),
        )

        course.enrolled = aggregates['enrolled__sum']
        course.enrolled_max = aggregates['enrolled_max__sum']
        course.waitlisted = aggregates['waitlisted__sum']

        if course.enrolled_max > 0:
            course.enrolled_percentage = min(float(course.enrolled) / float(course.enrolled_max), 1)
            course.open_seats = max(course.enrolled_max - course.enrolled, 0)
        else:
            course.enrolled_percentage = -1
            course.open_seats = 0

        course.save()


course_service = CourseService()
