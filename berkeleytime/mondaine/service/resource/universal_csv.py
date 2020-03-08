"""Resources for parsing the American Cultures requirement website."""
import csv
import os

from berkeleytime.config.general import SPECIAL_CHARACTER_ABBREVIATIONS
from mondaine.service.definition.mapper import MapperDefinition


def handler(csv_rel_path):
    csv_path = os.path.join(os.path.dirname(__file__), csv_rel_path)  # noqa
    if not os.path.exists(csv_path):
        return None
    csv_file = open(csv_path, 'rb')

    """Parse the csv and return a single breadth definition."""
    definition = MapperDefinition()

    # Iterate through each department, create a DepartmentDefinition
    # and add it to the final definition
    curr_csv = csv.reader(csv_file)
    dept_to_course_num = dict()
    for line in curr_csv:
        abbreviation, course_number = None, None
        if len(line) == 2:
            abbreviation = line[0]
            course_number = line[1]
        elif len(line) == 3:
            abbreviation = (line[0] + "," + line[1]).replace("\"", "")
            course_number = line[2]
        if abbreviation is not None and course_number is not None:
            dept_to_course_num.setdefault(abbreviation, set()).add(course_number)

    for abbreviation, course_numbers in dept_to_course_num.items():
        definition.add(
            abbreviation=_normalize_abbreviation(abbreviation),  # abbreviation as a string
            allowed=list(course_numbers)  # list of course_numbers
        )
    return definition


def _normalize_abbreviation(abbreviation):
    """Return the abbreviation with special characters (if it has them)"""
    return SPECIAL_CHARACTER_ABBREVIATIONS.get(abbreviation, abbreviation)
