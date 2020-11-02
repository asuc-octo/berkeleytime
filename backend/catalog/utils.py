import re


def extract_numeric_component(course_number):
    return re.search("[0-9]+", course_number).group(0)

def extract_prefix(course_number):
    """ Returns numeric component of course number, e.g. 61 for 61C """
    return re.search("^[A-Z]*", course_number).group(0)

def extract_suffix(course_number):
    """ Returns suffix of course number, e.g. C for 61C, or empty string if no suffix """
    return re.search("[A-Z]*$", course_number).group(0)

def sort_course_dicts(courses):
    """ Sorts course dictionaries

    @courses: iterable object containing dictionaries representing courses.
            Each course must have a course_number and abbreviation key

    @return: returns a new list containing the given courses, in naturally sorted order.

    """
    detailed_courses = [{
        "course": course,
        "numeric_course_number": int(extract_numeric_component(course["course_number"])),
        "prefix": extract_prefix(course["course_number"]),
        "suffix": extract_suffix(course["course_number"])
    } for course in courses]
    detailed_courses.sort(key=lambda course: course["suffix"])
    detailed_courses.sort(key=lambda course: course["prefix"])
    detailed_courses.sort(key=lambda course: course["numeric_course_number"])
    detailed_courses.sort(key=lambda course: course["course"]["abbreviation"])
    return [course_detail["course"] for course_detail in detailed_courses]