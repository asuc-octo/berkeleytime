"""Section Service."""
import logging
import os
import time
from multiprocessing.pool import ThreadPool

from berkeleytime.utils import AtomicInteger, BColors
from catalog.mapper import section_mapper
from catalog.models import Course, Section
from catalog.resource import sis_class_resource
from enrollment.mapper import enrollment_mapper
from enrollment.service import enrollment_service


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
NUM_THREADS = min(2 * os.cpu_count(), 16)


class SectionService:
    """Application logic for section information."""

    def update(self, semester, year, abbreviation=None, course_number=None):
        """Update all sections in a semester.

        If given abbreviation + course_number, update only that course's sections.
        """
        logger.info({
            'message': 'Updating sections.',
            'semester': semester,
            'year': year,
            'abbreviation': abbreviation,
            'course_number': course_number,
        })

        # Get list of courses for which to update sections
        courses = Course.objects.all()
        if abbreviation and course_number:
            courses = courses.filter(abbreviation=abbreviation, course_number=course_number)

        # Asynchronously perform an update for each course's sections
        i = AtomicInteger()
        def update_wrapper(course):
            i.inc()
            self._update_class(
                course=course,
                semester=semester,
                year=year,
            )
        p = ThreadPool(NUM_THREADS)
        result = p.map_async(update_wrapper, courses)

        # Log progress of updates
        print(BColors.OKGREEN + f'Starting job with {NUM_THREADS} workers.' + BColors.ENDC)
        while not result.ready():
            print(BColors.OKGREEN + f'Updating course {i.value() + 1} of {len(courses)}.' + BColors.ENDC)
            time.sleep(5)

        # Clear the cache to ensure an updated dropdown of courses with enrollment data
        # course_service.invalidate_courses_with_enrollment_cache()


    def _update_class(self, course, semester, year):
        """Update all sections for a course in a semester.

        Though not rigorously defined, a 'class' here is the collection
        of sections for a course offered in a single semester.
        """

        # Get response from SIS class resource
        response = sis_class_resource.get(
            semester=semester,
            year=year,
            course_id=course.id,
            abbreviation=course.abbreviation,
            course_number=course.course_number,
        )

        updated_section_ids = set()

        # Map response to Section and Enrollment objects and persist to database
        section_extras = {
            'course_id': int(course.id),
            'abbreviation': course.abbreviation,
            'course_number': course.course_number,
            'semester': semester,
            'year': year,
        }
        for sect in response:
            section_dict = section_mapper.map(sect, extras=section_extras)
            section, created = self.update_or_create_from_dict(section_dict)
            if semester != 'summer' and section.is_primary and not section.disabled:
                enrollment_dict = enrollment_mapper.map(sect, extras={'section_id': section.id})
                enrollment_service.update_or_create_from_dict(enrollment_dict)

            updated_section_ids.add(section.id)

        if len(updated_section_ids) > 0:
            logger.info({
                'message': 'Updated sections for course',
                'course': course,
                'sections updated': len(updated_section_ids),
            })

        # Disable existing section if data not found in response
        sections_to_disable = Section.objects.filter(
            course_id=course.id,
            semester=semester,
            year=year,
        ).exclude(id__in=updated_section_ids)
        for section in sections_to_disable:
            if not section.disabled:
                section.disabled = True
                # section.save()
                logger.info({
                    'message': 'Disabling section not in API response.',
                    'section': section,
                })


    def update_or_create_from_dict(self, section_dict):
        try:
            section_obj, created = Section.objects.update_or_create(
                course_id=section_dict['course_id'],
                semester=section_dict['semester'],
                year=section_dict['year'],
                section_number=section_dict['section_number'],
                kind=section_dict['kind'],
                defaults=section_dict,
            )
            logger.info({
                'message': 'Created/updated section object',
                'section': section_obj,
                'created': created,
            })
            return section_obj, created
        except:
            logger.exception({
                'message': 'Exception encountered while updating/creating section',
                'section_dict': section_dict,
            })


section_service = SectionService()
