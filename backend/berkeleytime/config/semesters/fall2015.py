import datetime, time

CURRENT_SEMESTER = 'fall'
CURRENT_YEAR = '2015'
CURRENT_SEMESTER_DISPLAY = "Fall 2015"

# http://registrar.berkeley.edu/DisplayMedia.aspx?ID=TBCalFa15.pdf
# April 6 Phase I begins
# July 14 Phase I ends
# July 16 Phase II begins
# August 16 Phase II ends
# August 17 Adjustment Period begins

TELEBEARS = {
    'phase1_start': datetime.datetime(2015, 4, 6),
    'phase2_start': datetime.datetime(2015, 7, 14),
    'phase1_end': datetime.datetime(2015, 7, 16),
    'phase2_end': datetime.datetime(2015, 8, 16),
    'adj_start': datetime.datetime(2015, 8, 17),
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