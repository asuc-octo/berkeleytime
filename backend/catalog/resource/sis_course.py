"""SIS Course Resourcen#12585."""
import logging
import requests
from retry import retry

from berkeleytime import settings

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class SISCourseResource:
    """Resource for SIS Course API."""

    headers = {
        'Accept': 'application/json',
        'app_id': settings.SIS_COURSE_APP_ID,
        'app_key': settings.SIS_COURSE_APP_KEY
    }
    url = 'https://apis.berkeley.edu/sis/v2/courses?page-number=%s&page-size=%s&status-code=ACTIVE'

    def get(self, page_number=0, page_size=100):
        """Return a generator of response chunks starting at start_index."""
        while True:
            logger.info({
                'message': 'Querying SIS Course API',
                'page_number': page_number,
                'page_size': page_size
            })
            try:
                yield from self._request(page_number, page_size)
                page_number += 1
            except:
                break


    @retry(tries=3)
    def _request(self, page_number, page_size):
        """Fetch SIS Course API response.

        Docs: https://api-central.berkeley.edu/api/46/interactive-docs
        """
        url = self.url % (page_number, page_size)
        try:
            response = requests.get(url, headers=self.headers)
            assert response.status_code in [200, 201]
            return response.json()['apiResponse']['response']['any']['courses']
        except AssertionError:
            logger.warning({
                'message': 'SIS Course API did not return valid data',
                'status_code': response.status_code,
                'page_number': page_number,
                'page_size': page_size,
            })
            raise
        except:
            logger.exception({
                'message': 'Unable to reach SIS Course API'
            })
            raise


sis_course_resource = SISCourseResource()
