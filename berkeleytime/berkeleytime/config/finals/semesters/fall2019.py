from berkeleytime.config.finals.finals import *
from berkeleytime.config.finals.finals_general import FINAL_TIMES

# CHANGE THESE DICTIONARIES SEMESTER TO SEMESTER AND TRIPLE CHECK THAT THEY ARE RIGHT
MWF_FINALS = {
    datetime.time(8, 0): FINAL_TIMES["Monday7-10PM"],
    datetime.time(9, 0): FINAL_TIMES["Thursday7-10PM"],
    datetime.time(10, 0): FINAL_TIMES["Monday8-11AM"],
    datetime.time(11, 0): FINAL_TIMES["Monday11:30-2:30PM"],
    datetime.time(12, 0): FINAL_TIMES["Friday11:30-2:30PM"],
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

# Mapper function for final times
def fall_2019_finals_logic(abbreviation, course_number, start_time, is_foreign_language, day_string):
    return None

finals_mapper = FinalTimesMapper(fall_2019_finals_logic)
