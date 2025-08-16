"""Configurations for Fall 2025."""
from berkeleytime.config.finals.semesters.fall2025 import *

import datetime

CURRENT_SEMESTER = 'fall'
CURRENT_YEAR = '2025'
CURRENT_SEMESTER_DISPLAY = 'Fall 2025'

# SIS API Keys
SIS_TERM_ID = 2258

TELEBEARS = {
    'phase1_start': datetime.datetime(2025, 4, 14), # april 14th
    'phase1_end': datetime.datetime(2025, 6, 13), # june 13th
    'phase2_start': datetime.datetime(2025, 7, 21), # july 21st
    'phase2_end': datetime.datetime(2025, 8, 17), # august 17th

    'adj_start': datetime.datetime(2025, 8, 18), # august 18th
}

INSTRUCTION = {
    'instruction_start': datetime.datetime(2025, 8, 27, 00, 00), # august 27th
    'instruction_end': datetime.datetime(2025, 12, 12, 00, 00) # december 12th
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
