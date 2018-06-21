"""Course Job."""
from catalog.service.course import course_service


class CourseJob(object):
    """Potentially asynchronous jobs for updating courses."""

    def update(self, start_index=0):
        """Update courses starting at an SIS API start index."""
        course_service.update(start_index=start_index)

course_job = CourseJob()
