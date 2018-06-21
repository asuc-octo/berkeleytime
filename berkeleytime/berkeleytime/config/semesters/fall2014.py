import datetime, time

# NOTE: The system is unavailable from Midnight to 7 am Monday through Friday, and from Midnight to Noon Saturday and Sunday.

CURRENT_SEMESTER = 'fall'
CURRENT_YEAR = '2014'
CURRENT_SEMESTER_DISPLAY = "Fall 2014"

# 2014
# Phase I: April 7 - July 15
# Phase II: July 17 - August 17
# Adjustment Period: Beginning August 18

TELEBEARS = {
    'phase1_start': datetime.datetime(2014, 4, 7),
    'phase2_start': datetime.datetime(2014, 7, 17),
    'phase1_end': datetime.datetime(2014, 7, 15),
    'phase2_end': datetime.datetime(2014, 8, 17),
    'adj_start': datetime.datetime(2014, 8, 18),
}

TELEBEARS_JSON = {
    "phase1_start_date": TELEBEARS['phase1_start'].strftime("%m/%d/%Y-%H:%M:%S"), "phase1_end_date": TELEBEARS['phase1_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase1_start_day": 1, "phase1_end_date": (TELEBEARS['phase1_end'] - TELEBEARS['phase1_start']).days + 1,
    "phase2_start_date": TELEBEARS['phase2_start'].strftime("%m/%d/%Y-%H:%M:%S"), "phase2_end_date": TELEBEARS['phase2_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase2_start_day": (TELEBEARS['phase2_start'] - TELEBEARS['phase1_start']).days + 1, "phase2_end_date": (TELEBEARS['phase2_end'] - TELEBEARS['phase1_start']).days + 1,
    "adj_start_date": TELEBEARS['adj_start'].strftime("%m/%d/%Y-%H:%M:%S"), "adj_start_day": (TELEBEARS['adj_start'] - TELEBEARS['phase1_start']).days + 1,
}

TELEBEARS_ALREADY_STARTED = datetime.datetime.now() >= TELEBEARS["phase1_start"]