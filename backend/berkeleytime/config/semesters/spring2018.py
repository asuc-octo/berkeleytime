"""Configurations for Spring 2018."""
from berkeleytime.config.finals.semesters.spring2018 import *

import datetime

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2018'
CURRENT_SEMESTER_DISPLAY = 'Spring 2018'

# SIS API Keys
SIS_TERM_ID = 2182

TELEBEARS = {
    'phase1_start': datetime.datetime(2017, 10, 16),
    'phase2_start': datetime.datetime(2017, 11, 15),
    'phase1_end': datetime.datetime(2017, 11, 12),
    'phase2_end': datetime.datetime(2018, 1, 7),
    'adj_start': datetime.datetime(2018, 1, 8),
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
