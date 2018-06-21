# utilities for catalog app
import datetime

import re
from berkeleytime.settings import LETTER_GRADE, GRADE_POINT


def is_post(request):
    return request.method == "POST"

def is_get(request):
    return request.method == "GET"

def first_error(form):
    try:
        form.errors.values()
        return form.errors.values()[0]
    except Exception as e:
        print e
        return "Something went wrong, but we're on it!"

def calculate_averages(grade):
    try:
        average = calculate_numeric_average(grade)
        return average, calculate_letter_average(average)
    except Exception as e:
        print "\nCalculation Error: calculate_average: " + str(e)

def calculate_numeric_average(grade):
    weighted_grade_point = map(lambda z: int(grade[z]) * GRADE_POINT[z], GRADE_POINT.keys())
    total_grade_point = reduce(lambda x, y: x + y, weighted_grade_point)
    average = total_grade_point/grade["total"] if grade["total"] != 0 else -1
    return average

def calculate_letter_average(number):
    """ Returns prefix of course number, e.g. C for C6, or empty string if no prefix """
    return LETTER_GRADE[min((abs(number - i), i) for i in LETTER_GRADE.keys())[1]]

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