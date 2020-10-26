"""Course Mapper."""

import logging
import traceback

from playlist.utils import utils
from catalog.service.exc import SISCourseResourceException
from catalog.models import Course

logger = logging.getLogger(__name__)

translations = {
    "BUS ADM": "UGBA",
    "SSEASN": "S,SEASN"
}

class CourseMapper:
    """Map SIS Class API response data to a dict."""

    def map(self, data: dict):
        """Take a SIS Course and return a single entity.Course."""
        try:
            course = {
                'title': data['title'],
                'abbreviation': translations.get(data['subjectArea']['code'], default=data['subjectArea']['code']),
                'course_number': data['catalogNumber']['formatted'],
                'description': data['description'],
                'department': self.get_course_department(data),
                'units': self.get_units(data),
            }
            if "preparation" in data:
                if "requiredText" in data["preparation"] and len(data["preparation"]["requiredText"]):
                    course["prerequisites"] = data["preparation"]["requiredText"]
            return Course(**course)
        except KeyError:
            traceback.print_exc()
            return None

    def get_course_department(self, data):
        """Return the course department.

        Even though SIS API returns a official course department
        we use our own for consistency across apps and ease of lookup
        """
        abbreviation = data['subjectArea']['code'].strip()
        return utils.abbreviation_to_department(abbreviation)

    def get_units(self, data):
        """Cast unit value to string, otherwise return None."""
        if 'credit' in data:
            if data['credit']['type'] == 'fixed':
                units = float(data['credit']['value']['fixed'].get('units'))
            elif data['credit']['type'] == 'range':
                minUnits = data['credit']['value']['range'].get('minUnits')
                maxUnits = data['credit']['value']['range'].get('maxUnits')
                units = str(float(minUnits)) + " - " + str(float(maxUnits))
            elif data['credit']['type'] == 'discrete':
                units = ' or '.join([str(float(units)) for units in data['credit']['value']['discrete'].get('units')])
            else:
                raise SISCourseResourceException('Incorrect credit type: ' + data['credit']['type'])
            if units:
                return str(units)
        return None

course_mapper = CourseMapper()