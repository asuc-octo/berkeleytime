"""Enrollment Service."""
from catalog.service.store.enrollment import enrollment_store


class EnrollmentService(object):
    """Application logic for enrollment information."""

    def update_or_create(self, section_id, enrollment):
        """Update/Create enrollment information."""
        enrollment_store.update_or_create(
            section_id=section_id,
            enrollment=enrollment
        )

    def get_latest(self, section_id):
        """Retrieve the latest enrollment."""
        return enrollment_store.get_latest(section_id=section_id)

enrollment_service = EnrollmentService()
