"""Configurations for Spring 2024."""
# from berkeleytime.config.finals.semesters.spring2024 import *

import datetime

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2024'
CURRENT_SEMESTER_DISPLAY = 'Spring 2024'

# SIS API Keys
SIS_TERM_ID = 2242

TELEBEARS = {
    'phase1_start': datetime.datetime(2024, 9, 16), #oct 16th
    'phase1_end': datetime.datetime(2024, 10, 5),   # nov 5th   
    'phase2_start': datetime.datetime(2024, 10, 14), #nov 14th
    'phase2_end': datetime.datetime(2024, 0, 7),    #jan 7th
    'adj_start': datetime.datetime(2024, 0, 8),     #jan 8th
}

INSTRUCTION = {
    'instruction_start': datetime.datetime(2024, 0, 16, 00, 00),    # jan 16th
    'instruction_end': datetime.datetime(2024, 3, 26, 00, 00)       #april 26th
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