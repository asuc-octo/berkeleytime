"""Configurations for Spring 2020."""
# from berkeleytime.config.finals.semesters.spring2020 import * # noqa

import datetime

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2020'
CURRENT_SEMESTER_DISPLAY = 'Spring 2020'

# SIS API Keys
SIS_TERM_ID = 2202

INSTRUCTION = {
    'instruction_start': datetime.datetime(2020, 1, 21, 00, 00),
    'instruction_end':datetime.datetime(2020, 5, 8, 00, 00)
}

TELEBEARS = {
    'phase1_start': datetime.datetime(2019, 10, 21),
    'phase1_end': datetime.datetime(2019, 11, 17),
    'phase2_start': datetime.datetime(2019, 11, 19),
    'phase2_end': datetime.datetime(2020, 1, 5),
    'adj_start': datetime.datetime(2020, 1, 6),
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
