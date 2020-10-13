'''Schedule Mapper.'''

import arrow
import logging

from berkeleytime.settings import finals_mapper
from catalog.models import Section

DAYS_OF_THE_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

logger = logging.getLogger(__name__)

class SectionMapper(object):
    '''Map SIS Class API response data to a Section object.'''

    def map(self, data, extras={}):
        try:
            kwargs = {
                'course_title': data['class']['course']['title'],
                'section_number': data['number'],
                'ccn': str(data['id']),
                'kind': data['component']['description'],
            }
            kwargs.update(self.get_is_primary(data=data))
            kwargs.update(self.get_datetime(data=data))
            kwargs.update(self.get_finals(kwargs, extras))
            kwargs.update(self.get_instructor(data=data))
            kwargs.update(self.get_status(data=data))
            kwargs.update(self.get_location_name(data=data))
            kwargs.update({
                'instruction_mode': data.get('instructionMode', {}).get('description')
            })
            kwargs.update(extras)

            # Include enrollment stats for optimization
            enrollment = self.get_enrollment_entity(data=data)
            kwargs.update(enrollment)

            return Section(**kwargs)
        except Exception as e:
            logger.exception({
                'message': 'Unknown exception while mapping Class API response to Section object'
            })
            raise

    def get_enrollment_entity(self, data):
        '''Take data and return a single entity.Enrollment.'''
        enrollment = data['enrollmentStatus']
        kwargs = {
            'enrolled_max': enrollment['maxEnroll'],
            'enrolled': enrollment['enrolledCount'],
            'waitlisted': enrollment['waitlistedCount'],
            'waitlisted_max': enrollment['maxWaitlist'],
        }
        return kwargs

    def get_is_primary(self, data):
        '''Get primary/secondary for a single section.'''
        is_primary = data['association']['primary']

        return {
            # TODO (Yuxin) get rid of this in database
            'suffix': 'P' if is_primary else 'S',
            'is_primary': is_primary is True,  # you can never be too sure
            'rank': 0 if is_primary else 1,
        }

    def _get_meeting(self, data):
        '''Get meeting information for a single section.'''
        # TODO (*) Schema does not currently support multiple meetings
        meeting = data['meetings'][0] if data.get('meetings') else None
        return meeting

    def get_datetime(self, data):
        '''Get date/time for a single section.'''
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

        return {
            'days': days,
            'start_time': arrow.get('1900-01-01 %s' % start_time).datetime if '00:00:00' not in start_time else None,
            'end_time': arrow.get('1900-01-01 %s' % end_time).datetime if '00:00:00' not in end_time else None,
        }

    def get_finals(self, kwargs, extras):
        '''Get final day/time for a primary section.'''
        if kwargs['is_primary']:
            data = {}
            data.update(kwargs)
            data.update(extras)

            finals_info = finals_mapper.map(data)

            if finals_info is not None:
                return {
                    'final_day': finals_info[0],
                    'final_start': arrow.get(
                        '1900-01-01 %s' % finals_info[1]
                    ).datetime,
                    'final_end': arrow.get(
                        '1900-01-01 %s' % finals_info[2]
                    ).datetime
                }
        return {}

    def get_instructor(self, data):
        '''Get the instructor from the first meeting of a single section.'''
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
        '''Take a name object from a single section and formats it.'''
        return (name['familyName'] + ' ' + name['givenName'][0]).upper()

    def get_status(self, data):
        '''Get whether a section is disabled.'''
        return {'disabled': not bool(data['printInScheduleOfClasses'])}

    def get_location_name(self, data):
        '''Get name of location.'''
        meeting = self._get_meeting(data)
        location = meeting.get('location') if meeting else None
        return {
            'location_name': location.get('description') if location else None
        }


section_mapper = SectionMapper()
