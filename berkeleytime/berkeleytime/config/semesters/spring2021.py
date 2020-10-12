'''Configurations for Spring 2021.'''
from berkeleytime.config.finals.semesters.spring2021 import *

import datetime

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2021'
CURRENT_SEMESTER_DISPLAY = 'Spring 2021'

# SIS API Keys
SIS_TERM_ID = 2212

TELEBEARS = {
    'phase1_start': datetime.datetime(2020, 10, 12),
    'phase1_end': datetime.datetime(2020, 11, 8),
    'phase2_start': datetime.datetime(2020, 11, 12),
    'phase2_end': datetime.datetime(2021, 1, 10),

    'adj_start': datetime.datetime(2021, 1, 11),
}

INSTRUCTION = {
    'instruction_start': datetime.datetime(2021, 1, 19, 00, 00),
    'instruction_end':datetime.datetime(2021, 5, 7, 00, 00)
}

# Please don't edit anything below this line unless you know what you are doing

TELEBEARS_JSON = {
    'phase1_start_date': TELEBEARS['phase1_start'].strftime('%m/%d/%Y-%H:%M:%S'),
    'phase1_end_date': TELEBEARS['phase1_end'].strftime('%m/%d/%Y-%H:%M:%S'),
    'phase1_start_day': 1,
    'phase1_end_date': (TELEBEARS['phase1_end'] - TELEBEARS['phase1_start']).days + 1,
    'phase2_start_date': TELEBEARS['phase2_start'].strftime('%m/%d/%Y-%H:%M:%S'),
    'phase2_end_date': TELEBEARS['phase2_end'].strftime('%m/%d/%Y-%H:%M:%S'),
    'phase2_start_day': (TELEBEARS['phase2_start'] - TELEBEARS['phase1_start']).days + 1,
    'phase2_end_date': (TELEBEARS['phase2_end'] - TELEBEARS['phase1_start']).days + 1,
    'adj_start_date': TELEBEARS['adj_start'].strftime('%m/%d/%Y-%H:%M:%S'),
    'adj_start_day': (TELEBEARS['adj_start'] - TELEBEARS['phase1_start']).days + 1,
}

TELEBEARS_ALREADY_STARTED = datetime.datetime.now() >= TELEBEARS['phase1_start']