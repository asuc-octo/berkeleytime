from berkeleytime.config.finals.utils.finals_utils import *

class FinalTimesMapper:
    """Maps class information to a finals time"""
    def __init__(self, generate_function):
        self._generate_finals_time = generate_function

    def map(self, data):
        """Return a finals time for information passed in."""

        day_string = data.get('days')
        start_time = data.get('start_time')
        abbreviation = data.get('abbreviation')
        course_number = data.get('course_number')

        # If incomplete information, then can't determine final time
        if not day_string or not start_time or not abbreviation or not course_number:
            return None

        day_string = day_normalize(day_string)
        start_time = trunc_time(start_time)
        foreign_language_boolean = is_foreign_language(abbreviation, course_number)

        return self._generate_finals_time(abbreviation, course_number, start_time, foreign_language_boolean, day_string)
