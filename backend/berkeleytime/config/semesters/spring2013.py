import datetime, time

# NOTE: The system is unavailable from Midnight to 7 am Monday through Friday, and from Midnight to Noon Saturday and Sunday.

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2013'
CURRENT_SEMESTER_DISPLAY = "Spring 2013"

TELEBEARS = {
    'phase1_start': datetime.datetime(2012, 10, 15),
    'phase2_start': datetime.datetime(2012, 11, 13),
    'phase1_end': datetime.datetime(2012, 11, 9),
    'phase2_end': datetime.datetime(2013, 1, 13),
    'adj_start': datetime.datetime(2013, 1, 14),
}

TELEBEARS_JSON = {
    "phase1_start_date": TELEBEARS['phase1_start'].strftime("%m/%d/%Y-%H:%M:%S"), "phase1_end_date": TELEBEARS['phase1_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase1_start_day": 1, "phase1_end_date": (TELEBEARS['phase1_end'] - TELEBEARS['phase1_start']).days + 1,
    "phase2_start_date": TELEBEARS['phase2_start'].strftime("%m/%d/%Y-%H:%M:%S"), "phase2_end_date": TELEBEARS['phase2_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase2_start_day": (TELEBEARS['phase2_start'] - TELEBEARS['phase1_start']).days + 1, "phase2_end_date": (TELEBEARS['phase2_end'] - TELEBEARS['phase1_start']).days + 1,
    "adj_start_date": TELEBEARS['adj_start'].strftime("%m/%d/%Y-%H:%M:%S"), "adj_start_day": (TELEBEARS['adj_start'] - TELEBEARS['phase1_start']).days + 1,
}
