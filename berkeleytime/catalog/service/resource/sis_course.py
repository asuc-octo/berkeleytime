"""SIS Course Resourcen#12585."""
import logging
import requests
from retry import retry

from berkeleytime import settings
from catalog.service.exc import SISCourseResourceException, SISCourseResource404Exception
from catalog.service.mapper.course import course_mapper

logger = logging.getLogger(__name__)

class SISCourseResource(object):
    """Resource for SIS Course API."""

    headers = {
        'Accept': 'application/json',
        'app_id': settings.SIS_COURSE_APP_ID,
        'app_key': settings.SIS_COURSE_APP_KEY
    }
    url = 'https://apis.berkeley.edu/sis/v2/courses?row-start=%s&row-limit=%s'  # noqa

    def get(self, start_index=0, limit=500):
        """Return a generator of courses starting at start_index."""
        while True:
            logger.info({
                'message': 'Querying SIS Course API',
                'start_index': start_index,
                'limit': limit
            })
            courses = self._get(index=start_index, limit=limit)
            for index, course in enumerate(courses):
                yield course

                if index == len(courses) - 1:
                    start_index += limit
                    courses = self._get(index=start_index, limit=limit)

    def _get(self, index, limit):
        """Return a list of entity.Course starting at index."""
        try:
            response = self._request(index, limit)
        except SISCourseResource404Exception as e:
            raise StopIteration
        self._validate_response(response)

        try:
            sis_courses = response['apiResponse']['response']['any']['courses']
            return [x for x in (course_mapper.map(c) for c in sis_courses) if x is not None]
        except Exception as e:
            # TODO (Yuxin) Do something here!
            print e
            pass

    @retry(SISCourseResourceException, tries=3)
    def _request(self, index, limit):
        """Fetch response from SIS course endpoint."""
        try:
            response = requests.get(
                self.url % (index, limit),
                headers=self.headers
            )
        except Exception as e:
            # SIS API is a piece of shit so just retry on everything else
            raise SISCourseResourceException({
                'message': 'Unable to request from SIS Course API',
                'exception': e
            })

        if response.status_code in [200, 201]:
            return response.json()

        # It's really ghetto that this is a 404
        elif response.status_code == 404:
            raise SISCourseResource404Exception({
                'message': 'SIS API returned 404 error',
                'status_code': 404
            })

        else:
            raise SISCourseResourceException({
                'message': 'SIS Course API response code is invalid',
                'status_code': response.status_code,
            })

    def _validate_response(self, response):
        try:
            return response
        except Exception as e:
            # TODO (Yuxin) We should actually raise something different here
            # since there is no need to retry a validation issue, gtfo
            raise SISCourseResourceException({
                'message': 'Could not validate response',
                'exception': unicode(e),
            })

sis_course_resource = SISCourseResource()
