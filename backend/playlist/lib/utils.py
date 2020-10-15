"""Utility functions for playlist."""
import re

from playlist import config
from unidecode import unidecode

translations = {
    "BUS ADM": "UGBA",
    "SSEASN": "S,SEASN"
}


def clean(target):
    """Clean target string via unidecode."""
    return str(
        unidecode(target)
    ).replace(u"*", u"").strip().encode("utf-8")


def mandatory(fn):
    """Raise AssertionError if return value of fn is empty or None.

    Otherwise, converts return value to a string and clears whitespace.
    """
    def wrapper(*args, **kwargs):
        returned = fn(*args, **kwargs)
        try:
            assert returned is not None and bool(clean(returned))
        except AssertionError as e:
            # TODO (Yuxin) throw something here
            print(returned, e)
            raise
        return clean(returned)
    return wrapper


def optional(fn):
    """Return cleaned result of wrapped function if it exists, else None."""
    def wrapper(*args, **kwargs):
        returned = fn(*args, **kwargs)
        # If returned is string-formattable, clean it, otherwise return None
        if returned and bool(clean(returned)):
            return clean(returned)

    return wrapper


def is_course_number(target):
    """Return True if target is a course number."""
    return bool(re.compile(r"\d").search(target))


def is_float(target):
    """Return True if str target is float-like."""
    try:
        return bool(float(target))
    except Exception:
        return False


def department_to_abbreviation(department_name):
    """Convert a department name to its corresponding abbreviation."""
    return config.department_to_abbreviation_mapper[department_name.upper()]


def abbreviation_to_department(abbreviation):
    """Convert an abbrevation to its corresponding department name."""
    return config.abbreviation_to_department_mapper[translate(abbreviation)]


def is_abbreviation(abbreviation):
    """Return True if abbreviation is an abbreviation, else False."""
    return translate(abbreviation) in config.abbreviation_to_department_mapper


def is_department(department_name):
    """Return True if department_name is a department name, else False."""
    return department_name.upper() in config.department_to_abbreviation_mapper

def translate(abbreviation):
    if abbreviation in translations:
        return translations[abbreviation]
    return abbreviation
