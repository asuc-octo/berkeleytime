"""Configurations for Fall 2023."""
from berkeleytime.config.finals.semesters.fall2023 import *

import datetime

CURRENT_SEMESTER = 'fall'
CURRENT_YEAR = '2023'
CURRENT_SEMESTER_DISPLAY = 'Fall 2023'

# SIS API Keys
SIS_TERM_ID = 2228

TELEBEARS = {
    'phase1_start': datetime.datetime(2023, 4, 17),
    'phase1_end': datetime.datetime(2023, 6, 16),
    'phase2_start': datetime.datetime(2023, 7, 17),
    'phase2_end': datetime.datetime(2023, 8, 13),

    'adj_start': datetime.datetime(2023, 8, 14),
}

INSTRUCTION = {
    'instruction_start': datetime.datetime(2023, 8, 23, 00, 00),
    'instruction_end': datetime.datetime(2023, 12, 8, 00, 00)
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