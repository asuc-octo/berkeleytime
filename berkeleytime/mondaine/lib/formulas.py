"""Collection of utility functions that return constraints.

A constraint is a function that takes a course-like object (Django course model
or mondaine Course object) and return True if the course satisfies the
constraint.
"""

import re

from mondaine.lib import utils


def gte_n_units(n):
    """Constrain the course to >= n units."""
    def satisfies(course):
        if not course.units:
            return False

        # If course.units is float-like, check if it is >= n
        elif utils.is_float(course.units):
            return float(course.units) >= n

        # If course.units is e.g. "1 or 4", check that at least one >= n
        elif "or" in course.units:
            lower, upper = course.units.replace("or", "").split()
            if float(lower) >= n or float(upper) >= n:
                return True

        # If course.units can be taken for more than n units
        elif "-" in course.units:
            lower, upper = course.units.replace("-", " ").split()
            return float(upper) >= n

        return False

    return satisfies


def exactly_n_units(n):
    """Constrain the course to exactly n units."""
    def satisfies(course):
        if not course.units:
            return False

        # If course.units is float-like, check if it is >= n
        elif utils.is_float(course.units):
            return float(course.units) == n

        # If course.units is e.g. "1 or 4", check that n is equal to one
        elif "or" in course.units:
            lower, upper = course.units.replace("or", "").split()
            if float(lower) == n or float(upper) == n:
                return True

        # If course.units is in the range of (lower, upper)
        elif "-" in course.units:
            lower, upper = course.units.replace("-", " ").split()
            if float(lower) <= n <= float(upper):
                return True

        return False

    return satisfies


def course_id_in(course_ids):
    """Constraint returns True iff course.id is in course_ids."""
    course_id_set = set(course_ids)  # throwback to CS 61B O(1)-swag

    def satisfies(course):
        return bool(course.id in course_id_set)
    return satisfies


def course_in(courses):
    """Constraint the course to a given list of courses.

    List of courses is represented as "{abbreviation} {course_number}"
    e.g. course_in(["COMPSCI 61A", "BIO 1A"])
    """
    def satisfies(course):
        key = "%s %s" % (course.abbreviation, course.course_number)
        return key in courses
    return satisfies


def course_not_in(courses):
    """Constraint returns True if "{abbreviation} {course_number}" not in the given list.""" # noqa
    def _satisfies(course):
        key = "%s %s" % (course.abbreviation, course.course_number)
        return key not in courses
    return _satisfies


def abbreviation_in(abbreviations):
    """Constrain the course to given abbreviations."""
    def _satisfies(course):
        return course.abbreviation in abbreviations
    return _satisfies


def course_integer_in(course_integers):
    """Constrain the numeric portion of course.course_number is in course_integers.""" # noqa
    def _satisfies(course):
        # Extract all digits from course_number, there should only be 1
        integers = re.findall(r'\d+', course.course_number)
        # print "{} in {}".format(int(integers[0]), course_integers)
        return int(integers[0]) in course_integers
    return _satisfies


def course_integer_not_in(course_integers):
    """Constrain the numeric portion of course.course_number is not in course_integers.""" # noqa
    def _satisfies(course):
        # Extract all digits from course_number, there should only be 1
        integers = re.findall(r'\d+', course.course_number)
        # print "{} not in {}".format(int(integers[0]), course_integers)
        return int(integers[0]) not in course_integers
    return _satisfies


def course_integer_lte_n(n):
    """Constrain the numeric portion of course.course_number to be <= n."""
    def _satisfies(course):
        # Extract all digits from course_number, there should only be 1
        integers = re.findall(r'\d+', course.course_number)
        return int(integers[0]) <= n
    return _satisfies


def not_in_definitions(definitions):
    """Return True only if ALL of the definitions are NOT satisfied by the course.""" # noqa
    def satisfies(course):
        return not any([d.satisfies(course) for d in definitions])
    return satisfies


def not_in_abbreviations(abbreviations):
    """Constraint returns True only if the course is not in any of the given department abbreviations.""" # noqa
    def satisfies(course):
        return course.abbreviation not in abbreviations
    return satisfies
