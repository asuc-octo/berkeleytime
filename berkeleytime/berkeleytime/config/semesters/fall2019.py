"""Configurations for Fall 2019."""
from berkeleytime.config.finals.semesters.fall2019 import * # noqa

import datetime

CURRENT_SEMESTER = 'fall'
CURRENT_YEAR = '2019'
CURRENT_SEMESTER_DISPLAY = 'Fall 2019'

# SIS API Keys
SIS_TERM_ID = 2198

TELEBEARS = {
    'phase1_start': datetime.datetime(2019, 4, 15),
    'phase1_end': datetime.datetime(2019, 6, 21), # Estimated
    'phase2_start': datetime.datetime(2019, 7, 29), # Estimated
    'phase2_end': datetime.datetime(2019, 8, 18), # Estimated
    'adj_start': datetime.datetime(2019, 8, 19), # Estimated
}

INSTRUCTION = {
    'instruction_start': datetime.datetime(2019, 8, 28, 00, 00),
    'instruction_end':datetime.datetime(2019, 12, 13, 00, 00)
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
