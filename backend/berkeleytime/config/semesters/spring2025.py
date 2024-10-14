"""Configurations for Spring 2024."""
from berkeleytime.config.finals.semesters.spring2024 import *

import datetime

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2025'
CURRENT_SEMESTER_DISPLAY = 'Spring 2025'

# SIS API Keys
SIS_TERM_ID = 2252

TELEBEARS = {
    'phase1_start': datetime.datetime(2024, 10, 28), # oct 28th
    'phase1_end': datetime.datetime(2024, 11, 17),   # nov 17th
    'phase2_start': datetime.datetime(2024, 11, 25), # nov 25th
    'phase2_end': datetime.datetime(2025, 1, 12),    # jan 12th
    'adj_start': datetime.datetime(2025, 1, 13),     # jan 13th
}

INSTRUCTION = {
    'instruction_start': datetime.datetime(2025, 1, 21, 00, 00),    # jan 21th
    'instruction_end': datetime.datetime(2025, 5, 2, 00, 00)       # may 2th
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
