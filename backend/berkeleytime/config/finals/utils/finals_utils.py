from berkeleytime.config.finals.finals_general import FOREIGN_LANGUAGES
import datetime

MWF = '135'
TR = '24'

MWF_DAYS = ['1', '3', '5']
TR_DAYS = ['2', '4']
WEEKEND_DAYS = ['6', '0'] # Saturday and Sunday respectively

def day_normalize(day_string):
    """Matches day strings from database to how the final parser likes it"""
    for day in MWF_DAYS: # If a class is offered on M, W, F, MW, MF, or WF, it will fall into the same start times as MWF.
        if day in day_string:
            return MWF
    for day in TR_DAYS: # If a class is offered on Tu or Th, it will fall into the same start times as TuTh.
        if day in day_string:
            return TR
    return day_string


def is_foreign_language(abbreviation, number):
    """Is the given class a foreign language?

    Looks at the dictionary in berkeley > config > finals > finals.py
    """
    if abbreviation in FOREIGN_LANGUAGES:
        return number in FOREIGN_LANGUAGES[abbreviation]
    return False

def trunc_time(start_time):
    """Truncates to the lowest hour and any class after 5 is now 5"""
    hour = start_time.hour
    if hour >= 17:
        hour = 17
    return datetime.time(hour, 0)

def is_weekend_class(day_string):
    """Is the given class on a Saturday or Sunday?"""
    for day in WEEKEND_DAYS:
        if day in day_string:
            return True
    return False
