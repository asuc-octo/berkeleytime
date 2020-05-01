"""SIS Schedule Resource."""
import logging
import re
import requests

from retry import retry

from berkeleytime import settings
from berkeleytime.config.semesters.util.term import get_sis_term_id
from catalog.service.exc import ScheduleResourceException
from catalog.service.mapper.schedule import schedule_mapper
from catalog.service.validator.schedule import schedule_validator

from catalog.models import Section
from django.core.cache import cache

logger = logging.getLogger(__name__)
ENROLLMENT_CACHE_TIMEOUT = 900

class ScheduleResource(object):
    """Interface with SIS endpoint for schedule information."""

    headers = {
        'Accept': 'application/json',
        'app_id': settings.SIS_CLASS_APP_ID,
        'app_key': settings.SIS_CLASS_APP_KEY
    }
    url = 'https://apis.berkeley.edu/sis/v1/classes/sections?term-id=%s&subject-area-code=%s&catalog-number=%s&page-size=400'  # noqa
    #https://apis.berkeley.edu/uat/sis/v1/classes/sections?term-id=2182&subject-area-code=ENGLISH'  # noqa

    def get(self, semester, year, course_id, abbreviation, course_number, log=False): # noqa
        """Fetch entity.Sections for a given abbreviation and course_number.

        TODO(noah): Passing in all this crap is gross, let's make it a
            configuration object.
        """
        # Include this data with every entity.Section
        extras = {
            'course_id': course_id,
            'abbreviation': abbreviation,
            'course_number': course_number,
            'semester': semester,
            'year': year,
        }

        sections = cache.get("schedule_resource {} {} {} {}".format(semester, year, abbreviation, course_number))
        if sections:
            print("cache hit in schedule_resource")
        else:
            response = self._request(
                semester=semester,
                year=year,
                abbreviation=abbreviation,
                course_number=course_number,
            )

            if not response:
                logger.info({
                    'message': 'SIS could not find sections for course',
                    'course_id': int(course_id),
                    'abbreviation': str(abbreviation),
                    'course_number': str(course_number),
                })
                return []
            elif log:
                logger.info({
                    'message': 'Queried SIS for the sections for course',
                    'course_id': int(course_id),
                    'abbreviation': str(abbreviation),
                    'course_number': str(course_number),
                })

            sections = response['apiResponse']['response']['classSections']
            cache.set("schedule_resource {} {} {} {}".format(semester, year, abbreviation, course_number), sections, ENROLLMENT_CACHE_TIMEOUT)
        return self.process_sections(sections, extras=extras)  # noqa

    @retry(ScheduleResourceException, tries=3)
    def _request(self, semester, year, abbreviation, course_number): # noqa
        """Fetch response from SIS endpoint.

        https://api-central.berkeley.edu/api/45/interactive-docs
        """
        formatted_abbreviation = re.compile('[^a-zA-Z]').sub('', abbreviation)
        url = self.url % (
            get_sis_term_id(semester, year),
            formatted_abbreviation,
            course_number
        )

        try:
            response = requests.get(url, headers=self.headers)
            json_response = response.json()

        except Exception as e:
            raise ScheduleResourceException({
                'message': 'Failed to reach SIS endpoint',
                'exception': unicode(e),
                'url': url,
            })

        response = schedule_validator.validate(data=json_response)
        response_code = int(response['apiResponse']['httpStatus']['code'])
        response_description = response['apiResponse']['httpStatus']['description'] # noqa

        if response_code in [404]:  # SIS Not found
            if response_description == "Not Found":
                self._disable_sections(abbreviation, course_number, semester, year) # noqa
            return

        if response_code not in [200, 201]:
            raise ScheduleResourceException({
                'message': 'SIS did not return a valid response code',
                'response_code': response_code,
            })

        return response

    def process_sections(self, sections, extras):
        """Process all sections for a single course."""
        # return [self.process_section(section, extras=extras) for section in sections]  # noqa
        return [
            schedule_mapper.map(s, extras=extras) for s in sections
        ]

    def _disable_sections(self, semester, year, abbreviation, course_number):
        """If we get a 404 error, check if we have sections for that class and disable all of them.""" # noqa
        sections = Section.objects.filter(
            semester=semester,
            year=year,
            abbreviation=abbreviation,
            course_number=course_number,
            disabled=False,
        )
        if len(sections) > 0:
            for enabled_section in sections:
                enabled_section.disabled = True
                enabled_section.save()

            logger.info({
                'message': 'SIS returned 404 and found enabled sections. Disabled {0} sections'.format(len(sections)), # noqa
                'abbreviation': str(abbreviation),
                'course_number': str(course_number),
            })

schedule_resource = ScheduleResource()
