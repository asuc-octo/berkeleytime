import datetime
from rfc3339 import rfc3339
# Util functions for views.py
# from datetime import datetime
# from datetime import date
import datetime
from dateutil.relativedelta import *
from rfc3339 import rfc3339
from berkeleytime.settings import INSTRUCTION as instruction

# Return a dictionary of useful information from a list of sections
# with each containing sections_info and finals_info
def section_objects_to_info_dict(sections):
    all_sections_info_dict = {}

    for section in sections:
        section_info = get_section_info(section)

        # if exception occurs and an empty info dict is return, we move on
        if not section_info:
            continue

        finals_info = {}
        if section.is_primary:
            final_info_dict = {
                'abbreviation': section.abbreviation,
                'course_number': section.course_number,
                'final_start': section.final_start.strftime('%H:%M'),
                'final_end': section.final_end.strftime('%H:%M'),
                'final_day': section.final_day
            }
            finals_info = final_info_dict

        all_sections_info_dict[section.ccn] = {
            'sections_info': section_info,
            'finals_info': finals_info
        }
    return all_sections_info_dict

# Returns a dictionary of attributes in a section object
def get_section_info(section):
    try:
        section_info_dict = {
            'abbreviation': section.abbreviation,
            'course_number': section.course_number,
            'course_title': section.course_title,
            'section_number' : section.section_number,
            'type': section.kind,
            'ccn': section.ccn,
            'days': section.days,
            'start_time': section.start_time.strftime('%H:%M'), # these are strings, not unicode
            'end_time': section.end_time.strftime('%H:%M'),
            'is_primary': str(section.is_primary).lower(),
            'location': section.location_name,
            'instructor': section.instructor.replace('\'', '') if section.instructor is not None else section.instructor,
            'enrolled_max': section.enrolled_max,
            'enrolled': section.enrolled,
            'waitlisted': section.waitlisted,
            'waitlisted_max': section.waitlisted_max,
            'word_days': section.word_days,
            'start_date': rfc3339(datetime.date(2018, 1, 16)), # Current Semester's Starting Class Date in the RFC3339 Format
            'end_date': rfc3339(datetime.date(2018, 5, 4)) # Current Semester's Ending Class Date
        }
        if section.is_primary:
            section_info_dict['final_start'] = section.final_start.strftime('%H:%M')
            section_info_dict['final_end'] = section.final_end.strftime('%H:%M')
            section_info_dict['final_word_day'] = section.final_word_day
        return section_info_dict
    except AttributeError as e:
        # Attribute error occured, likely due to either start_time, end_time, final_start, or final_end being None
        return {}

# Converts section objects into Google Calendar event data
def section_to_event(section):

    date_today = rfc3339(datetime.datetime.now())[:11]

    section_dict = get_section_info(section)

    days_string = days_num_to_string(section_dict['days'])
    start_date = rfc3339(instruction["instruction_start"] + get_next_section_weekday(instruction["instruction_start"].weekday(), section_dict['days']))[:11]
    end_date = rfc3339(instruction["instruction_end"], utc=True).replace("-", "").replace(":", "")

    summary = '{} {}'.format(section_dict['abbreviation'], section_dict['course_number'])
    location = section_dict['location'] or ''
    instructor = section_dict['instructor'] or ''
    startDateTime = '{}{}:00'.format(start_date, section_dict['start_time'])
    endDateTime = '{}{}:00'.format(start_date, section_dict['end_time'])
    recurranceDetails = 'RRULE:FREQ=WEEKLY;BYDAY={};UNTIL={}'.format(days_string, end_date)

    event = {
      'summary': summary,
      'location': location,
      'start': {
        'dateTime': startDateTime,
        'timeZone': 'America/Los_Angeles',
      },
      'end': {
        'dateTime': endDateTime,
        'timeZone': 'America/Los_Angeles',
      },
      'recurrence': [
        recurranceDetails
      ],
      'reminders': {
        'useDefault' : False,
        'overrides' : [
            {'method': 'popup', 'minutes': 10},
        ],
      },
    }

    return event

# Takes the days string and converts them into a two letter day format
def days_num_to_string(days_num):
    days_dict = {
        '1': 'MO',
        '2': 'TU',
        '3': 'WE',
        '4': 'TH',
        '5': 'FR',
        '6': 'SA',
        '7': 'SU'
    }

    day_string = ''
    for num in days_num:
        day_string += days_dict[num] + ","
    return day_string[:-1]

def get_next_section_weekday(instruction_start, section_days):
    section_days = [int(x) - 1 for x in section_days]
    for day in section_days:
        if day >= instruction_start:
            return relativedelta(weekday=day)
    return relativedelta(weekday=section_days[0])
