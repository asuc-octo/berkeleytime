'''SIS Course Resourcen#12585.'''
import logging
import requests
from retry import retry

from berkeleytime import settings

logger = logging.getLogger(__name__)

class SISCourseResource():
    '''Resource for SIS Course API.'''

    headers = {
        'Accept': 'application/json',
        'app_id': settings.SIS_COURSE_APP_ID,
        'app_key': settings.SIS_COURSE_APP_KEY
    }
    url = 'https://apis.berkeley.edu/sis/v2/courses?row-start=%s&row-limit=%s&status-code=ACTIVE'

    def get(self, start_index=0, limit=500):
        '''Return a generator of response chunks starting at start_index.'''
        while True:
            logger.info({
                'message': 'Querying SIS Course API',
                'start_index': start_index,
                'limit': limit
            })
            try:
                yield self._request(start_index, limit)
                start_index += limit
            except:
                raise StopIteration

    @retry(tries=3)
    def _request(self, index, limit):
        '''
        Fetch SIS Course API response.
        Docs: https://api-central.berkeley.edu/api/46/interactive-docs
        '''
        url = self.url % (index, limit)
        try:
            response = requests.get(url, headers=self.headers)
            assert response.status_code in [200, 201]
            return response.json()['apiResponse']['response']['any']['courses']
        except AssertionError:
            logger.exception({
                'message': 'SIS Course API did not return valid data',
                'status_code': response.status_code
            })
            raise
        except:
            logger.exception({
                'message': 'Unable to reach SIS Course API'
            })
            raise

sis_course_resource = SISCourseResource()
