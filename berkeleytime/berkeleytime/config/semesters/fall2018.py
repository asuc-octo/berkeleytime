"""Configurations for Fall 2018."""
from berkeleytime.config.finals.semesters.fall2018 import * # noqa

import datetime

CURRENT_SEMESTER = 'fall'
CURRENT_YEAR = '2018'
CURRENT_SEMESTER_DISPLAY = 'Fall 2018'

# SIS API Keys
SIS_TERM_ID = 2188

TELEBEARS = {
    'phase1_start': datetime.datetime(2018, 4, 16),
    'phase1_end': datetime.datetime(2018, 6, 15),
    'phase2_start': datetime.datetime(2018, 7, 23),
    'phase2_end': datetime.datetime(2018, 8, 12),
    'adj_start': datetime.datetime(2018, 8, 13),
}

INSTRUCTION = {
    'instruction_start': datetime.datetime(2018, 8, 22, 00, 00),
    'instruction_end':datetime.datetime(2018, 12, 07, 00, 00)
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
