'''Enrollment Service.'''

from catalog.resource.sis_class import sis_class_resource
from catalog.mapper.section import section_mapper
from enrollment.mapper import enrollment_mapper


class EnrollmentService(object):
    """Application logic for enrollment information."""

    def get_live_enrollment(
            self, semester, year, course_id,
            abbreviation, course_number, log=False):
        response = sis_class_resource.get(
                semester=semester,
                year=year,
                course_id=course_id,
                abbreviation=abbreviation,
                course_number=course_number,
                log=True,
            )
        sections = [section_mapper.map(sect) for sect in response]
        enrollments = [enrollment_mapper.map(sect) for i, sect in enumerate(response)]
        return enrollments, sections


enrollment_service = EnrollmentService()
