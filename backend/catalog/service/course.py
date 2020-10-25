"""Course Service."""

import logging

from django.core.cache import cache
from django.db import models
from attrdict import AttrDict

from catalog.resource.sis_course import sis_course_resource
from catalog.models import Course, Section
from grades.models import Grade
from grades.utils import add_up_grades, gpa_to_letter_grade
from catalog.mapper import course_mapper

logger = logging.getLogger(__name__)

class CourseService:
    _courses_with_enrollment_cache_name = "enrollment__courses"

    def __init__(self):
        """Construct list of all derived fields."""
        self.__derived_fields = (
            Course._derived_grade_fields +
            Course._derived_enrollment_fields +
            Course._derived_playlist_fields
        )

    def update(self, start_index=0):
        """Update courses starting from an SIS index."""
        for course in sis_course_resource.get(start_index):
            self.update_or_create(course)

    def _exclude_derived_fields(self, course):
        """Map Course to dict and exclude all derived fields."""
        return {
            k: v for (k, v) in course.flatten().items() if k not in self.__derived_fields  # noqa
        }
    
    def _set_field(self, entry, field, value):
        """Take a django.db.models.Models and sets entry.field to value, but does not save."""  # noqa
        if not isinstance(entry, models.Model):
            raise ValueError({
                'message': 'Argument must be type of models.Model',
                'entry': entry,
                'type': type(entry),
            })

        previous_value = getattr(entry, field)
        if previous_value == value:
            return

        setattr(entry, field, value)


    def update_or_create(self, course):
        """Update/create a single Course."""
        entry, created = Course.objects.get_or_create(
            abbreviation=course.abbreviation,
            course_number=course.course_number,
            defaults=self._exclude_derived_fields(course),
        )

        logger.info({
            'message': 'Updating/creating course',
            'abbreviation': course.abbreviation,
            'course_number': course.course_number,
            'title': course.title,
            'created': created,
        })

        if not created:
            for field, value in self._exclude_derived_fields(course).items():
                print(entry, field, value)
                self._set_field(entry, field, value)
            entry.save()

        return entry

    def get(self, id, abbreviation=None, course_number=None):
        """Return a Course given a id OR abbreviation, course_number."""
        if (id is None) and (None in (abbreviation, course_number,)):
            raise ValueError({
                'message': 'Must specify either id or abbreviation, course_number',  # noqa
                'id': id,
                'abbreviation': abbreviation,
                'course_number': course_number,
            })
        
        try:
            if id:
                entry = Course.objects.get(id=id)
            else:
                entry = Course.objects.get(
                    abbreviation=abbreviation,
                    course_number=course_number
                )
            return entry
        except models.Course.DoesNotExist:
            logger.warning({
                'message': 'Course not found',
                'id': id,
                'abbreviation': abbreviation,
                'course_number': course_number,
            })
            return None

    def find(self):
        """Return all courses that fit a certain criteria."""
        return Course.objects.all()

    def find_ids_by_semester(self, semester, year):
        """Return all course ids that are offered for semester, year."""
        return (
            Section.objects.filter(
                semester=semester, year=year, disabled=False
            )
            .values_list('course_id', flat=True)
            .distinct()
        )
    
    def distinct_field(self, field_name):
        """Return an array of distinct field names."""
        return (
            Course.objects.values_list(field_name, flat=True)
            .distinct()
        )

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
                self._set_field(course, field, default)
            return

        def sum_fields(sections, field_name):
            """Sum over section.field_name iff section.field is not None."""
            values = [getattr(s, field_name) for s in sections if getattr(s, field_name) is not None]  # noqa
            rtn = sum(values) if values else -1  # -1 means no data
            return rtn

        # Get the some of each value over all primary sections
        summary = {
            'enrolled': sum_fields(primary_sections, 'enrolled'),
            'enrolled_max': sum_fields(primary_sections, 'enrolled_max'),
            'waitlisted': sum_fields(primary_sections, 'waitlisted'),
        }
        # Exit if enrolled_max is -1 (no data)
        # OR enrolled is -1 (no data), it's ok if enrolled is 0
        if summary['enrolled_max'] == -1 or summary['enrolled'] == -1:
            return

        # Do not want to divide by 0!
        if summary['enrolled_max'] != 0:
            summary['enrolled_percentage'] = float(summary['enrolled']) / float(summary['enrolled_max'])
            if summary['enrolled_percentage'] > 1:
                summary['enrolled_percentage'] = 1.0
        else:
            # Default percentage if enrolled_max is -1, most likely bug in the API
            # This will ensure that the front won't populate the field
            summary['enrolled_percentage'] = -1

        # Take the max in case SIS fucks up and returns negative numbers
        summary['open_seats'] = max(summary['enrolled_max'] - summary['enrolled'], 0)
        course = Course.objects.get(id=course_id)
        for field in summary:
            self._set_field(course, field, summary[field])
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