"""Utility functions for playlist."""
import re

from playlist.utils.config import config_dict


translations = {
    "BUS ADM": "UGBA",
    "SSEASN": "S,SEASN"
}


def clean(target):
    """Clean target string."""
    return str(target).replace('*', '').strip()


def is_float(target):
    """Return True if str target is float-like."""
    try:
        return bool(float(target))
    except Exception:
        return False


def department_to_abbreviation(department_name):
    """Convert a department name to its corresponding abbreviation."""
    return config_dict.department_to_abbreviation_mapper.get(department_name.upper())


def abbreviation_to_department(abbreviation):
    """Convert an abbrevation to its corresponding department name."""
    return config_dict.abbreviation_to_department_mapper.get(translate(abbreviation))


def is_abbreviation(abbreviation):
    """Return True if abbreviation is an abbreviation, else False."""
    return translate(abbreviation) in config_dict.abbreviation_to_department_mapper


def is_department(department_name):
    """Return True if department_name is a department name, else False."""
    return department_name.upper() in config_dict.department_to_abbreviation_mapper


def translate(abbreviation):
    if abbreviation in translations:
        return translations[abbreviation]
    return abbreviation
