"""Configurations for Fall 2024."""
from berkeleytime.config.finals.semesters.fall2024 import *

import datetime

CURRENT_SEMESTER = 'fall'
CURRENT_YEAR = '2024'
CURRENT_SEMESTER_DISPLAY = 'Fall 2024'

# SIS API Keys
SIS_TERM_ID = 2248

TELEBEARS = {
    'phase1_start': datetime.datetime(2024, 4, 22),
    'phase1_end': datetime.datetime(2024, 6, 21),
    'phase2_start': datetime.datetime(2024, 7, 22),
    'phase2_end': datetime.datetime(2024, 8, 18),

    'adj_start': datetime.datetime(2024, 8, 19),
}

INSTRUCTION = {
    'instruction_start': datetime.datetime(2024, 8, 28, 00, 00),
    'instruction_end': datetime.datetime(2024, 12, 13, 00, 00)
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
