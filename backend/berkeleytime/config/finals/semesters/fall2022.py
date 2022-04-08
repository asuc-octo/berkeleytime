from berkeleytime.config.finals.finals import *
from berkeleytime.config.finals.finals_general import FINAL_TIMES

# CHANGE THESE DICTIONARIES SEMESTER TO SEMESTER AND TRIPLE CHECK THAT THEY ARE RIGHT
# Source: https://registrar.berkeley.edu/scheduling/academic-scheduling/final-exam-guide-schedules

MWF_FINALS = {
    datetime.time(8, 0): FINAL_TIMES["Monday7-10PM"],
    datetime.time(9, 0): FINAL_TIMES["Thursday7-10PM"],
    datetime.time(10, 0): FINAL_TIMES["Monday8-11AM"],
    datetime.time(11, 0): FINAL_TIMES["Monday11:30-2:30PM"],
    datetime.time(12, 0): FINAL_TIMES["Thursday11:30-2:30PM"],
    datetime.time(13, 0): FINAL_TIMES["Wednesday7-10PM"],
    datetime.time(14, 0): FINAL_TIMES["Thursday3-6PM"],
    datetime.time(15, 0): FINAL_TIMES["Tuesday7-10PM"],
    datetime.time(16, 0): FINAL_TIMES["Thursday8-11AM"],
    datetime.time(17, 0): FINAL_TIMES["Friday3-6PM"]
}

TR_FINALS = {
    datetime.time(8, 0): FINAL_TIMES["Wednesday3-6PM"],
    datetime.time(9, 0): FINAL_TIMES["Tuesday3-6PM"],
    datetime.time(10, 0): FINAL_TIMES["Friday3-6PM"],
    datetime.time(11, 0): FINAL_TIMES["Wednesday8-11AM"],
    datetime.time(12, 0): FINAL_TIMES["Friday8-11AM"],
    datetime.time(13, 0): FINAL_TIMES["Friday8-11AM"],
    datetime.time(14, 0): FINAL_TIMES["Tuesday8-11AM"],
    datetime.time(15, 0): FINAL_TIMES["Friday7-10PM"],
    datetime.time(16, 0): FINAL_TIMES["Friday7-10PM"],
    datetime.time(17, 0): FINAL_TIMES["Thursday11:30-2:30PM"]
}

HARD_CODED = [
    ("ECON", ['1', '100B'], FINAL_TIMES.get("Tuesday11:30-2:30PM")),
    ("UGBA", ["101B"], FINAL_TIMES.get("Tuesday11:30-2:30PM")),
    ("CHEM", ["1A", "1B", "3A", "3B", "4A", "4B"], FINAL_TIMES.get("Monday3-6PM")),
    ("ECON", ["140"], FINAL_TIMES.get("Monday3-6PM")),
    ("ENGLISH", ['1A', '1B', 'R1A', 'R1B'], FINAL_TIMES.get("Friday3-6PM")),
]

# Mapper function for final times
def fall_2022_finals_logic(abbreviation, course_number, start_time, is_foreign_language, day_string):
    for dept, numbers, time in HARD_CODED:
        if dept == abbreviation and course_number in numbers:
            return time
    if is_foreign_language or course_number[0] == "W":
        return FINAL_TIMES.get("Wednesday11:30-2:30PM")
    elif day_string == MWF:
        return MWF_FINALS.get(start_time)
    elif day_string == TR:
        return TR_FINALS.get(start_time)
    elif is_weekend_class(day_string):
        return FINAL_TIMES.get("Wednesday3-6PM")
    return None

finals_mapper = FinalTimesMapper(fall_2022_finals_logic)