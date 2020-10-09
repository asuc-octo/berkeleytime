import datetime, time

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2015'
CURRENT_SEMESTER_DISPLAY = 'Spring 2015'


# Spring 2015 Enrollment Periods
# Phase I: October 20 - November 16
# Phase II: November 17 - January 11
# Adjustment Period: Beginning January 12


TELEBEARS = {
    'phase1_start': datetime.datetime(2014, 10, 20),
    'phase2_start': datetime.datetime(2014, 11, 17),
    'phase1_end': datetime.datetime(2014, 11, 16),
    'phase2_end': datetime.datetime(2015, 1, 11),
    'adj_start': datetime.datetime(2015, 1, 12),
}

TELEBEARS_JSON = {
    "phase1_start_date": TELEBEARS['phase1_start'].strftime("%m/%d/%Y-%H:%M:%S"), "phase1_end_date": TELEBEARS['phase1_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase1_start_day": 1, "phase1_end_date": (TELEBEARS['phase1_end'] - TELEBEARS['phase1_start']).days + 1,
    "phase2_start_date": TELEBEARS['phase2_start'].strftime("%m/%d/%Y-%H:%M:%S"), "phase2_end_date": TELEBEARS['phase2_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase2_start_day": (TELEBEARS['phase2_start'] - TELEBEARS['phase1_start']).days + 1, "phase2_end_date": (TELEBEARS['phase2_end'] - TELEBEARS['phase1_start']).days + 1,
    "adj_start_date": TELEBEARS['adj_start'].strftime("%m/%d/%Y-%H:%M:%S"), "adj_start_day": (TELEBEARS['adj_start'] - TELEBEARS['phase1_start']).days + 1,
}

TELEBEARS_ALREADY_STARTED = datetime.datetime.now() >= TELEBEARS["phase1_start"]
