"""Course Store."""
import logging

from attrdict import AttrDict

from catalog import models
from catalog.service.entity.course import Course
from catalog.service.store import utils
from data.lib.grade import get_letter_grades
from data.lib.grade import gpa_to_letter_grade
from data.lib.grade import letter_grade_to_field_name
from data.lib.grade import letter_grade_to_gpa

logger = logging.getLogger(__name__)


class CourseStore(object):
    """Postgres interface for Courses."""

    def __init__(self):
        """Construct list of all derived fields."""
        self.__derived_fields = (
            models.Course._derived_grade_fields +
            models.Course._derived_enrollment_fields +
            models.Course._derived_playlist_fields
        )

    def get(self, id, abbreviation, course_number):
        """Return a entity.Course given a id OR abbreviation, course_number."""
        if (id is None) and (None in (abbreviation, course_number,)):
            raise ValueError({
                'message': 'Must specify either id or abbreviation, course_number',  # noqa
                'id': id,
                'abbreviation': abbreviation,
                'course_number': course_number,
            })

        try:
            if id:
                entry = models.Course.objects.get(id=id)
            else:
                entry = models.Course.objects.get(
                    abbreviation=abbreviation,
                    course_number=course_number
                )
            return Course(entry.__dict__, strict=False)

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
        courses = models.Course.objects.all()
        return [Course(entry.__dict__, strict=False) for entry in courses]

    def find_ids_by_semester(self, semester, year):
        """Return all course ids that are offered for semester, year."""
        return (
            models.Section.objects.filter(
                semester=semester, year=year, disabled=False
            )
            .values_list('course_id', flat=True)
            .distinct()
        )

    def distinct_field(self, field_name):
        """Return a distinct array of field name."""
        return (
            models.Course.objects.values_list(field_name, flat=True)
            .distinct()
        )

    def _exclude_derived_fields(self, course):
        """Map entity.Course to dict and exclude all derived fields."""
        return {
            k: v for (k, v) in course.flatten().items() if k not in self.__derived_fields  # noqa
        }

    def update_or_create(self, course):
        """Update/create a single entity.Course."""
        entry, created = models.Course.objects.get_or_create(
            abbreviation=course.abbreviation,
            course_number=course.course_number,
            defaults=self._exclude_derived_fields(course),
        )

        logger.info({
            'message': 'Updating/creating course',
            'abbreviation': course.abbreviation,
            'course_number': course.course_number,
            'created': created,
        })

        if not created:
            for field, value in self._exclude_derived_fields(course).items():
                utils.set_field(entry, field, value)
            entry.save()

        return Course(entry.__dict__, strict=False)

    def _update_derived_enrollment_fields(self, course_id, semester, year):
        """Update enrollment summary fields with the latest enrollment."""
        # TODO (Yuxin) Only update if the current semester, year
        primary_sections = models.Section.objects.filter(
            course_id=course_id, semester=semester, year=year, is_primary=True, disabled=False
        )

        if not primary_sections:
            course = models.Course.objects.get(id=course_id)
            for field in models.Course._derived_enrollment_fields:
                default = models.Course._meta.get_field(field).get_default()
                utils.set_field(course, field, default)
            return

        def _sum(sections, field_name):
            """Sum over section.field_name iff section.field is not None."""
            values = [getattr(s, field_name) for s in sections if getattr(s, field_name) is not None]  # noqa
            rtn = sum(values) if values else -1  # -1 means no data
            return rtn

        # Get the some of each value over all primary sections
        summary = AttrDict({
            'enrolled': _sum(primary_sections, 'enrolled'),
            'enrolled_max': _sum(primary_sections, 'enrolled_max'),
            'waitlisted': _sum(primary_sections, 'waitlisted'),
        })

        # Exit if enrolled_max is -1 (no data)
        # OR enrolled is -1 (no data), it's ok if enrolled is 0
        if summary.enrolled_max in (-1,) or summary.enrolled in (-1,):
            return

        # Do not want to divide by 0!
        if summary.enrolled_max != 0:
            enrolled_percentage = float(summary.enrolled) / float(summary.enrolled_max)
            if enrolled_percentage > 1:
                enrolled_percentage = 1.0
        else:
            # Default percentage if enrolled_max is -1, most likely bug in the API
            # This will ensure that the front won't populate the field
            enrolled_percentage = -1

        summary.enrolled_percentage = enrolled_percentage  # noqa
        # Take the max in case SIS fucks up and returns negative numbers
        summary.open_seats = max(summary.enrolled_max - summary.enrolled, 0)
        course = models.Course.objects.get(id=course_id)
        for field in models.Course._derived_enrollment_fields:
            derived_value = getattr(summary, field)
            utils.set_field(course, field, derived_value)
        course.save()

    def _update_derived_grade_fields(self, course_id):
        """Take a course_id and recalculate its derived grade fields."""
        grades = models.Grade.objects.filter(course_id=course_id)
        if not grades:
            return

        # Counter for letter grades weighted by their GPA value (e.g. 100 * B+ 3.3)  # noqa
        weighted_letter_grade_counter = {lg: 0 for lg in get_letter_grades()}
        total = 0

        # Sum up all letter grades across all models.Grade
        for grade in grades:
            for letter_grade in weighted_letter_grade_counter.keys():
                field_name = letter_grade_to_field_name(letter_grade)
                count = getattr(grade, field_name)
                total += count

                weighted_letter_grade_counter[letter_grade] += count * letter_grade_to_gpa(letter_grade)  # noqa

        if not total:
            return

        weighted_total = float(sum(weighted_letter_grade_counter.values()))
        course = models.Course.objects.get(pk=course_id)
        course.grade_average = weighted_total / total
        course.letter_average = gpa_to_letter_grade(weighted_total / total)
        course.save()

course_store = CourseStore()
