"""Configurations for Spring 2018."""
from berkeleytime.config.finals.semesters.spring2018 import * # noqa

import datetime

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2019'
CURRENT_SEMESTER_DISPLAY = 'Spring 2019'

# SIS API Keys
SIS_TERM_ID = 2192

INSTRUCTION = {
    'instruction_start': datetime.datetime(2019, 1, 22, 00, 00),
    'instruction_end':datetime.datetime(2019, 5, 3, 00, 00)
}

TELEBEARS = {
    'phase1_start': datetime.datetime(2018, 10, 15),
    'phase2_start': datetime.datetime(2018, 11, 13),
    'phase1_end': datetime.datetime(2018, 11, 11),
    'phase2_end': datetime.datetime(2019, 1, 6),
    'adj_start': datetime.datetime(2019, 1, 7),
}

# Please don't edit anything below this line unless you know what you are doing

TELEBEARS_JSON = {
    'phase1_start_date': TELEBEARS['phase1_start'].strftime('%m/%d/%Y-%H:%M:%S'),  # noqa
    'phase1_end_date': TELEBEARS['phase1_end'].strftime('%m/%d/%Y-%H:%M:%S'),  # noqa
    'phase1_start_day': 1,  # noqa
    'phase1_end_date': (TELEBEARS['phase1_end'] - TELEBEARS['phase1_start']).days + 1,  # noqa
    'phase2_start_date': TELEBEARS['phase2_start'].strftime('%m/%d/%Y-%H:%M:%S'),  # noqa
    'phase2_end_date': TELEBEARS['phase2_end'].strftime('%m/%d/%Y-%H:%M:%S'),  # noqa
    'phase2_start_day': (TELEBEARS['phase2_start'] - TELEBEARS['phase1_start']).days + 1,  # noqa
    'phase2_end_date': (TELEBEARS['phase2_end'] - TELEBEARS['phase1_start']).days + 1,  # noqa
    'adj_start_date': TELEBEARS['adj_start'].strftime('%m/%d/%Y-%H:%M:%S'),  # noqa
    'adj_start_day': (TELEBEARS['adj_start'] - TELEBEARS['phase1_start']).days + 1,  # noqa
}

TELEBEARS_ALREADY_STARTED = datetime.datetime.now() >= TELEBEARS['phase1_start']  # noqa
