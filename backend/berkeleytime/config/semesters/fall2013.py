import datetime, time

CURRENT_SEMESTER = 'fall'
CURRENT_YEAR = '2013'
CURRENT_SEMESTER_DISPLAY = 'Fall 2013'

TELEBEARS = {
    'phase1_start': datetime.datetime(2013, 4, 8),
    'phase2_start': datetime.datetime(2013, 7, 12),
    'phase1_end': datetime.datetime(2013, 7, 10),
    'phase2_end': datetime.datetime(2013, 8, 11),
    'adj_start': datetime.datetime(2013, 8, 12),
}

TELEBEARS_JSON = {
    "phase1_start_date": TELEBEARS['phase1_start'].strftime("%m/%d/%Y-%H:%M:%S"), "phase1_end_date": TELEBEARS['phase1_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase1_start_day": 1, "phase1_end_date": (TELEBEARS['phase1_end'] - TELEBEARS['phase1_start']).days + 1,
    "phase2_start_date": TELEBEARS['phase2_start'].strftime("%m/%d/%Y-%H:%M:%S"), "phase2_end_date": TELEBEARS['phase2_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase2_start_day": (TELEBEARS['phase2_start'] - TELEBEARS['phase1_start']).days + 1, "phase2_end_date": (TELEBEARS['phase2_end'] - TELEBEARS['phase1_start']).days + 1,
    "adj_start_date": TELEBEARS['adj_start'].strftime("%m/%d/%Y-%H:%M:%S"), "adj_start_day": (TELEBEARS['adj_start'] - TELEBEARS['phase1_start']).days + 1,
}
