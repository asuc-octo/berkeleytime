"""Configurations for Spring 2017."""
from berkeleytime.config.finals.semesters.spring2017 import *

import datetime

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2017'
CURRENT_SEMESTER_DISPLAY = 'Spring 2017'

# SIS API Keys
SIS_TERM_ID = 2172

TELEBEARS = {
    'phase1_start': datetime.datetime(2016, 10, 17),
    'phase2_start': datetime.datetime(2016, 11, 16),
    'phase1_end': datetime.datetime(2016, 11, 13),
    'phase2_end': datetime.datetime(2017, 1, 8),
    'adj_start': datetime.datetime(2016, 1, 9),
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