import datetime, time

CURRENT_SEMESTER = 'spring'
CURRENT_YEAR = '2016'
CURRENT_SEMESTER_DISPLAY = "Spring 2016"

# http://registrar.berkeley.edu/telebears_calendar.html
# October 19 Phase I begins
# November 15 Phase I ends
# November 16 Phase II begins
# January 10 Phase II ends
# January 11 Adjustment Period begins

TELEBEARS = {
    'phase1_start': datetime.datetime(2015, 10, 19),
    'phase2_start': datetime.datetime(2015, 11, 16),
    'phase1_end': datetime.datetime(2015, 11, 15),
    'phase2_end': datetime.datetime(2016, 1, 10),
    'adj_start': datetime.datetime(2016, 1, 11),
}

##### DO NOT EDIT ANYTHING BELOW THIS LINE UNLESS YOU KNOW WHAT YOU ARE DOING #####

TELEBEARS_JSON = {
    "phase1_start_date": TELEBEARS['phase1_start'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase1_end_date": TELEBEARS['phase1_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase1_start_day": 1,
    "phase1_end_date": (TELEBEARS['phase1_end'] - TELEBEARS['phase1_start']).days + 1,
    "phase2_start_date": TELEBEARS['phase2_start'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase2_end_date": TELEBEARS['phase2_end'].strftime("%m/%d/%Y-%H:%M:%S"),
    "phase2_start_day": (TELEBEARS['phase2_start'] - TELEBEARS['phase1_start']).days + 1,
    "phase2_end_date": (TELEBEARS['phase2_end'] - TELEBEARS['phase1_start']).days + 1,
    "adj_start_date": TELEBEARS['adj_start'].strftime("%m/%d/%Y-%H:%M:%S"),
    "adj_start_day": (TELEBEARS['adj_start'] - TELEBEARS['phase1_start']).days + 1,
}

TELEBEARS_ALREADY_STARTED = datetime.datetime.now() >= TELEBEARS["phase1_start"]