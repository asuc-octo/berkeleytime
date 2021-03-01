"""Schedule Mapper."""

import arrow
import sys

from berkeleytime.settings import finals_mapper
from catalog.models import Section


DAYS_OF_THE_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

class SectionMapper:
    """Map SIS Class API response data to a dict."""

    def map(self, data, extras={}):
        try:
            section_dict = {
                'course_title': data['class']['course']['title'],
                'section_number': data['number'],
                'ccn': str(data['id']),
                'kind': data['component']['description'],
            }
            section_dict.update(self.get_association(data=data))
            section_dict.update(self.get_datetime(data=data))
            section_dict.update(self.get_finals(section_dict, extras))
            section_dict.update(self.get_instructor(data=data))
            section_dict.update(self.get_status(data=data))
            section_dict.update(self.get_location_name(data=data))
            section_dict.update(self.get_instruction_mode(data=data))
            section_dict.update(extras)

            # Include enrollment stats for optimization
            section_dict.update(self.get_enrollment(data=data))

            return section_dict
        except Exception as e:
            print('Unknown exception while mapping Class API response to Section object', e, file=sys.stderr)
            return {}

    def get_enrollment(self, data):
        """Get enrollment data."""
        enrollment = data['enrollmentStatus']
        kwargs = {
            'enrolled_max': enrollment['maxEnroll'],
            'enrolled': enrollment['enrolledCount'],
            'waitlisted': enrollment['waitlistedCount'],
            'waitlisted_max': enrollment['maxWaitlist'],
        }
        return kwargs

    def get_association(self, data):
        """Get primary/secondary for a single section."""
        association = data.get('association', {})

        return {
            'is_primary': association.get('primary', False) is True,
            'primary_section': association.get('primaryAssociatedSectionId')
        }

    def _get_meeting(self, data):
        """Get meeting information for a single section."""
        # TODO (*) Schema does not currently support multiple meetings
        meeting = data['meetings'][0] if data.get('meetings') else {}
        return meeting

    def get_datetime(self, data):
        """Get date/time for a single section."""
        meeting, days = self._get_meeting(data=data), str()
        if not meeting:
            return dict()

        # Format days of the week where Sunday = 0, Saturday = 6
        for index, day in enumerate(DAYS_OF_THE_WEEK):
            days += str(index) if meeting.get('meets%s' % day) else str()

        if not days:
            return {}

        # Get start/end time of section
        start_time = meeting['startTime']
        end_time = meeting['endTime']

        if '00:00:00' in start_time or '00:00:00' in end_time:
            start_time_utc = None
            end_time_utc = None
        else:
            start_time_utc = arrow.get(f'1900-01-01 {start_time}').replace(tzinfo='US/Pacific').datetime
            end_time_utc = arrow.get(f'1900-01-01 {end_time}').replace(tzinfo='US/Pacific').datetime

        return {
            'days': days,
            'start_time': start_time_utc,
            'end_time': end_time_utc,
        }

    def get_finals(self, kwargs, extras):
        """Get final day/time for a primary section."""
        if kwargs['is_primary']:
            data = {}
            data.update(kwargs)
            data.update(extras)

            finals_info = finals_mapper.map(data)

            if finals_info is not None:
                return {
                    'final_day': finals_info[0],
                    'final_start': arrow.get(f'1900-01-01 {finals_info[1]}').replace(tzinfo='US/Pacific').datetime,
                    'final_end': arrow.get(f'1900-01-01 {finals_info[2]}').replace(tzinfo='US/Pacific').datetime,
                }
        return {}

    def get_instructor(self, data):
        """Get the instructor from the first meeting of a single section."""
        meeting = self._get_meeting(data=data)
        if not meeting:
            return dict()
        assigned_instructors = meeting.get('assignedInstructors')
        if not assigned_instructors:
            return dict()

        all_instructors = []
        for instructor in assigned_instructors:
            code_to_name = {}
            instructor = instructor.get('instructor')
            if not instructor:
                continue
            names = instructor.get('names')
            if not names:
                continue
            for name in names:
                code_to_name[name['type']['code']] = name

            name_to_add = ''
            # Choose primary name over preferred name
            if 'PRI' in code_to_name:
                name_to_add = self._format_name(code_to_name['PRI'])
            else:
                name_to_add = self._format_name(code_to_name['PRF'])
            if name_to_add not in all_instructors:
                all_instructors.append(name_to_add)

        return {
            'instructor': ', '.join(all_instructors)
        }

    def _format_name(self, name):
        """Take a name object from a single section and formats it."""
        return (name['familyName'] + ' ' + name['givenName'][0]).upper()

    def get_status(self, data):
        """Get whether a section is disabled."""
        return {'disabled': not bool(data['printInScheduleOfClasses'])}

    def get_location_name(self, data):
        """Get name of location."""
        meeting = self._get_meeting(data)
        location = meeting.get('location', {}).get('description', '')
        return {
            'location_name': location,
        }

    def get_instruction_mode(self, data):
        """Get instruction mode."""
        return {
            'instruction_mode': data.get('instructionMode', {}).get('description')
        }


section_mapper = SectionMapper()
