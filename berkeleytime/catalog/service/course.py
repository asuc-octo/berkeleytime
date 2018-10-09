"""Course Service."""
from catalog.service.resource.sis_course import sis_course_resource
from catalog.service.store.course import course_store


class CourseService(object):
    """Application logic for courses."""

    def update(self, start_index=0):
        """Update courses starting from an SIS index."""
        for course in sis_course_resource.get(start_index):
            self.update_or_create(course)

    def update_or_create(self, course):
        """Update or create a single entity.Course."""
        return course_store.update_or_create(course)

    def get(self, id, abbreviation=None, course_number=None):
        """Return a course entity given a id OR abbreviation, course_number."""
        return course_store.get(id, abbreviation, course_number)

    def find(self):
        """Return a list of courses that fit a certain criteria."""
        return course_store.find()

    def find_ids_by_semester(self, semester, year):
        """Return a list of course ids offered in semester, year."""
        return course_store.find_ids_by_semester(semester, year)

    def distinct_field(self, field_name):
        """Return an array of distinct field names."""
        return course_store.distinct_field(field_name)

    def invalidate_courses_with_enrollment_cache(self):
        """Invalidate the cache we use to store data of courses that have enrollment."""
        corse_store.invalidate_courses_with_enrollment_cache()

course_service = CourseService()
