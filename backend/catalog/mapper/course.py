"""Course Mapper."""
import sys

from playlist.utils import utils

class CourseMapper:
    """Map SIS Course API response data to a dict."""

    def map(self, data, extras={}, unknown_departments=None):
        try:
            course_dict = {
                'title': data['title'],
                'course_number': data['catalogNumber']['formatted'],
                'description': data['description'],
                'cross_listing': data.get('crossListing', {}).get('courses', [])
            }
            course_dict.update(self.get_abbreviation_and_department(data, unknown_departments))
            course_dict.update(self.get_units(data))
            course_dict.update(self.get_prerequisites(data))
            course_dict.update(extras)

            return course_dict

        except Exception as e:
            print('Exception while mapping Course API response to Course dict', e, file=sys.stderr)
            return {}


    def get_abbreviation_and_department(self, data, unknown_departments=None):
        """Return abbreviation and department, preferably our canonical version.

        First, try to get the canonical abbreviation from the response's
        department. If successful, also try to get the canonical department
        from the canonical abbreviation.

        If unsuccessful, try to get the canonical department from the
        response's abbreviation. If successful, also try to get the
        canonical abbreviation from the canonical department.

        If unsuccessful, use the raw abbreviation and department.
        """
        raw_department = data['subjectArea']['description']
        raw_abbreviation = data['subjectArea']['code']

        abbreviation = utils.department_to_abbreviation(raw_department)
        department = utils.abbreviation_to_department(raw_abbreviation)

        if abbreviation:
            department = utils.abbreviation_to_department(abbreviation)
        elif department:
            abbreviation = utils.department_to_abbreviation(department)
        else:
            if unknown_departments is not None:
                unknown_departments.add((abbreviation, department))
            raise Exception('Could not parse abbreviation and department:', raw_abbreviation, raw_department)

        return {
            'abbreviation': abbreviation,
            'department': department,
        }


    def get_units(self, data):
        """Cast unit value to string, otherwise return None."""
        units = ''
        if 'credit' in data:
            if data['credit']['type'] == 'fixed':
                units = float(data['credit']['value']['fixed'].get('units'))
            elif data['credit']['type'] == 'range':
                minUnits = data['credit']['value']['range'].get('minUnits')
                maxUnits = data['credit']['value']['range'].get('maxUnits')
                units = str(float(minUnits)) + ' - ' + str(float(maxUnits))
            elif data['credit']['type'] == 'discrete':
                units = ' or '.join([str(float(units)) for units in data['credit']['value']['discrete'].get('units')])
            else:
                print({
                    'message': 'Incorrect credit type: ' + data['credit']['type']
                }, file=sys.stderr)

        return {
            'units': units,
        }


    def get_prerequisites(self, data):
        """If a course has prerequisites, save them as a string."""
        prereqs = ''
        if 'preparation' in data and 'requiredText' in data['preparation']:
            prereqs = data['preparation']['requiredText']

        return {
            'prerequisites': prereqs,
        }


course_mapper = CourseMapper()
