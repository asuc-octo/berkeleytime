"""Configurations for Spring 2026."""
from berkeleytime.config.finals.semesters.spring2026 import *

import datetime

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2026'
CURRENT_SEMESTER_DISPLAY = 'Spring 2026'

# SIS API Keys
SIS_TERM_ID = 2262

TELEBEARS = {
    'phase1_start': datetime.datetime(2025, 10, 27), # october 27th
    'phase1_end': datetime.datetime(2025, 11, 16), # november 16th
    'phase2_start': datetime.datetime(2025, 11, 24), # november 24th
    'phase2_end': datetime.datetime(2026, 1, 11), # january 11th

    'adj_start': datetime.datetime(2026, 1, 12), # january 12th
}

INSTRUCTION = {
    'instruction_start': datetime.datetime(2026, 1, 20, 00, 00), # january 20th
    'instruction_end': datetime.datetime(2026, 5, 8, 00, 00) # may 8th
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
