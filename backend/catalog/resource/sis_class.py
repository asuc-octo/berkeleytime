"""SIS Schedule Resource."""
import logging
import re
import requests

from django.core.cache import cache
from retry import retry

from berkeleytime import settings
from berkeleytime.config.semesters.util.term import get_sis_term_id

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
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
        response = cache.get('class_resource {} {} {} {}'.format(semester, year, abbreviation, course_number))
        if response:
            logger.info('Cache hit in class resource')
            return response

        response = self._request(
            semester=semester,
            year=year,
            abbreviation=abbreviation,
            course_number=course_number,
        )

        log_info = {
            'course_id': course_id,
            'abbreviation': abbreviation,
            'course_number': course_number,
            'year': year,
            'semester': semester
        }

        if not response:
            log_info['message'] = 'SIS could not find sections for course'
            logger.info(log_info)
            return []

        if log:
            log_info['message'] = 'Queried SIS for the sections for course'
            logger.info(log_info)

        cache.set('class_resource {} {} {} {}'.format(semester, year, abbreviation, course_number), response, CACHE_TIMEOUT)

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
            response = requests.get(url, headers=self.headers)
            assert response.status_code in [200, 201]
            return response.json()['apiResponse']['response']['classSections']
        except AssertionError:
            logger.exception({
                'message': 'SIS Course API did not return valid data',
                'status_code': response.status_code,
                'url': url
            })
            return []
        except:
            logger.exception({
                'message': 'Unable to reach SIS Course API',
                'url': url
            })
            raise


sis_class_resource = SISClassResource()
