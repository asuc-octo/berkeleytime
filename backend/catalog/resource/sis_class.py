"""SIS Schedule Resource."""
import re
import requests
import sys
from requests.exceptions import Timeout

from django.core.cache import cache
from retry import retry

from berkeleytime import settings
from berkeleytime.config.semesters.util.term import get_sis_term_id

CACHE_TIMEOUT = 900

class SISClassResource:
    """Interface with SIS Class API."""

    headers = {
        'Accept': 'application/json',
        'app_id': settings.SIS_CLASS_APP_ID,
        'app_key': settings.SIS_CLASS_APP_KEY
    }
    # Example URL: https://apis.berkeley.edu/uat/sis/v1/classes/sections?term-id=2182&subject-area-code=ENGLISH'
    url = 'https://apis.berkeley.edu/sis/v1/classes/sections?term-id=%s&subject-area-code=%s&catalog-number=%s&page-size=400'

    def get(self, semester, year, course_id, abbreviation, course_number, log=False):
        """Fetch (cached) SIS Class API response."""
        response = cache.get('class_resource {} {} {} {} new'.format(semester, year, abbreviation, course_number))
        if response:
            print('Cache hit in class resource')
            return response

        response = self._request(
            semester=semester,
            year=year,
            abbreviation=abbreviation,
            course_number=course_number,
        )

        cache.set('class_resource {} {} {} {} new'.format(semester, year, abbreviation, course_number), response, CACHE_TIMEOUT)

        return response

    @retry(tries=3)
    def _request(self, semester, year, abbreviation, course_number):
        """Fetch SIS Class API response.

        Docs: https://api-central.berkeley.edu/api/45/interactive-docs
        """
        stripped_abbreviation = re.compile('[^a-zA-Z]').sub('', abbreviation)
        url = self.url % (
            get_sis_term_id(semester, year),
            stripped_abbreviation,
            course_number
        )

        try:
            response = requests.get(url, headers=self.headers, timeout=10.0)
            assert response.status_code in [200, 201]
            return response.json()['apiResponse']['response']['classSections']
        except Timeout as e:
            print({
                'message': 'Request to SIS Class API timed out',
                'url': url,
                'exception': e
            }, file=sys.stderr)
            return []
        except AssertionError as e:
            print({
                'message': 'SIS Class API did not return valid data',
                'status_code': response.status_code,
                'url': url
            }, e, file=sys.stderr)
            return []
        except Exception as e:
            print('Unable to reach SIS Class API', url, e, file=sys.stderr)
            raise


sis_class_resource = SISClassResource()
