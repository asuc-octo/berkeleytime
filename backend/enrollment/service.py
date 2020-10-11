'''Enrollment Service.'''

from catalog.resource.sis_class import sis_class_resource
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
        enrollments = [enrollment_mapper.map(sect_enroll) for sect_enroll in response]
        sections = []


enrollment_service = EnrollmentService()
