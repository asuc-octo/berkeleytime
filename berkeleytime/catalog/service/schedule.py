"""Schedule Service."""
from catalog.service.course import course_service
from catalog.service.store.course import course_store
from catalog.service.section import section_service
from catalog.service.enrollment import enrollment_service
from catalog.service.resource.schedule import schedule_resource

import logging

logger = logging.getLogger(__name__)


class ScheduleService(object):
    """Schedule Service."""

    def update(self, course_id, semester, year, should_record_enrollment): # noqa
        """Update all the sections for a single course."""
        course = course_service.get(id=course_id)

        schedules = schedule_resource.get(
            course_id=course_id,
            semester=semester,
            year=year,
            abbreviation=course.abbreviation,
            course_number=course.course_number,
        )

        updated_section_ids = set()
        for schedule in schedules:
            section = section_service.update_or_create(
                section=schedule.section
            )
            updated_section_ids.add(section['id'])
            if should_record_enrollment and section.is_primary is True and section.disabled is False: # noqa
                enrollment_service.update_or_create(
                    section_id=section.id,
                    enrollment=schedule.enrollment,
                )

        existing_sections = section_service.find_by_course_id(
            course_id=course_id,
            semester=semester,
            year=year,
        )
        # if a section is not showing up in the API response, disable it
        for s in existing_sections:
            if s['id'] not in updated_section_ids and not s['disabled']:
                logger.info({
                    'message': 'Existing section does not appear in API response. Disabling section', # noqa
                    'section_id': s['id']
                })
                s['disabled'] = True
                section_service.update_or_create(s)
        # if no sections are offered in current semester, make sure course
        # enrollment is reset
        if not schedules and should_record_enrollment:
            course_store._update_derived_enrollment_fields(
                course_id,
                semester,
                year,
            )

schedule_service = ScheduleService()
