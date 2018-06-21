"""Bookstore terms resource."""
from collections import namedtuple
import requests
from voluptuous import REMOVE_EXTRA
from voluptuous import MultipleInvalid
from voluptuous import Schema

from marketplace.service.exceptions import BookstoreResourceException

BookstoreDepartment = namedtuple('BookstoreDepartment', ['id', 'department_name', 'department_code']) # noqa


class BookstoreDepartmentsResource(object):
    """Resource for bookstore departments."""

    url = 'https://calstudentstore.berkeley.edu/checkout/onepage/availableDepartments/' # noqa

    def get(self, term):
        """Get the departments."""
        try:
            # schoolId: 6 indicates UC Berkeley (as oopposed to UCB Extension)
            response = requests.post(self.url, data={
                'schoolId': 6, 'termNameId': term.id
            })
            return [
                BookstoreDepartment(**datum)
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
                        'id': unicode,
                        'department_name': unicode,
                        'department_code': unicode,
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

bookstore_departments_resource = BookstoreDepartmentsResource()
