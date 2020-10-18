"""Course Service."""

import logging

from catalog.models import Course
from catalog.mapper import course_mapper
from django.core.cache import cache

logger = logging.getLogger(__name__)

class CourseService:
    _courses_with_enrollment_cache_name = "enrollment__courses"

    def update(self, start_index=0):
        for course in sis_course_resource.get(start_index):
            course_dict = course_mapper.map(course)
            self.update_or_create(course_dict)

    def update_or_create_from_dict(self, course):
        logger.info({
            'message': 'Updating/creating course',
            'abbreviation': course.abbreviation,
            'course_number': course.course_number,
            'title': course.title,
            'created': created,
        })

        return Course.objects.update_or_create(
            abbreviation=course.abbreviation,
            course_number=course.course_number,
            defaults=course
        )

    def get(self, id, abbreviation=None, course_number=None):
        pass

    def find(self):
        pass

    def find_ids_by_semester(self, semester, year):
        pass
    
    def distinct_field(self, field_name):
        pass

    def invalidate_courses_with_enrollment_cache(self):
        cache.delete(self._courses_with_enrollment_cache_name)

course_service = CourseService()