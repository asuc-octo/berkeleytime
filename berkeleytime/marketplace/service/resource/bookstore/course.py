"""Bookstore courses resource."""
from collections import namedtuple
import requests
from voluptuous import REMOVE_EXTRA
from voluptuous import MultipleInvalid
from voluptuous import Schema

from marketplace.service.exceptions import BookstoreResourceException

BookstoreCourse = namedtuple('BookstoreCourse', ['course_code', 'course_name', 'department']) # noqa


class BookstoreCoursesResource(object):
    """Resource for bookstore courses."""

    url = 'https://calstudentstore.berkeley.edu/checkout/onepage/availableCourses/' # noqa

    def get(self, term, department):
        """Get the departments."""
        try:
            # schoolId: 6 indicates UC Berkeley (as oopposed to UCB Extension)
            response = requests.post(self.url, data={
                'schoolId': 6,
                'termNameId': term.id,
                'departmentId': department.id,
            })
            return [
                BookstoreCourse(department=department, **datum)
                for datum in self._validate(response.json())
            ]
        except ValueError:
            raise BookstoreResourceException(
                message='Could not parse json data. Response code: {}'.format(
                    response.status_code
                ),
                url=self.url
            )

    def _validate(self, data):
        """Validate a bookstore term."""
        try:
            return Schema(
                [
                    {
                        'course_code': unicode,
                        'course_name': unicode,
                    }
                ],
                required=True,
                extra=REMOVE_EXTRA,
            )(data)
        except MultipleInvalid as e:
            raise BookstoreResourceException(
                message='Invalid json from bookstore: {}'.format(e.message),
                url=self.url
            )

bookstore_courses_resource = BookstoreCoursesResource()
