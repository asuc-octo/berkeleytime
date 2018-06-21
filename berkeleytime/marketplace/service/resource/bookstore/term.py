"""Bookstore terms resource."""
from collections import namedtuple
import requests
from voluptuous import REMOVE_EXTRA
from voluptuous import MultipleInvalid
from voluptuous import Schema

from marketplace.service.exceptions import BookstoreResourceException

BookstoreTerm = namedtuple('BookstoreTerm', ['id', 'school_id', 'term_name', 'active']) # noqa


class BookstoreTermsResource(object):
    """Resource for bookstore terms."""

    url = 'https://calstudentstore.berkeley.edu/checkout/onepage/availableTerms/' # noqa

    def get(self):
        """Get the terms."""
        try:
            # schoolId: 6 indicates UC Berkeley (as oopposed to UCB Extension)
            response = requests.post(self.url, data={'schoolId': 6})
            return [
                BookstoreTerm(**datum)
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
                        'school_id': unicode,
                        'term_name': unicode,
                        'active': unicode
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

bookstore_terms_resource = BookstoreTermsResource()
