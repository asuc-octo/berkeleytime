import datetime, time

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2014'
CURRENT_SEMESTER_DISPLAY = 'Spring 2014'

TELEBEARS = {
    'phase1_start': datetime.datetime(2013, 10, 21),
    'phase2_start': datetime.datetime(2013, 11, 12),
    'phase1_end': datetime.datetime(2013, 11, 8),
    'phase2_end': datetime.datetime(2014, 1, 12),
    'adj_start': datetime.datetime(2014, 1, 13),
}

TELEBEARS_JSON = {
    "phase1_start_date": TELEBEARS['phase1_start'].strftime("%m/%d/%Y-%H:%M:%S"), "phase1_end_date": TELEBEARS['phase1_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase1_start_day": 1, "phase1_end_date": (TELEBEARS['phase1_end'] - TELEBEARS['phase1_start']).days + 1,
    "phase2_start_date": TELEBEARS['phase2_start'].strftime("%m/%d/%Y-%H:%M:%S"), "phase2_end_date": TELEBEARS['phase2_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase2_start_day": (TELEBEARS['phase2_start'] - TELEBEARS['phase1_start']).days + 1, "phase2_end_date": (TELEBEARS['phase2_end'] - TELEBEARS['phase1_start']).days + 1,
    "adj_start_date": TELEBEARS['adj_start'].strftime("%m/%d/%Y-%H:%M:%S"), "adj_start_day": (TELEBEARS['adj_start'] - TELEBEARS['phase1_start']).days + 1,
}

TELEBEARS_ALREADY_STARTED = datetime.datetime.now() >= TELEBEARS["phase1_start"]
