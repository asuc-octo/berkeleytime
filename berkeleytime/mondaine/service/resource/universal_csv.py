"""Resources for parsing the American Cultures requirement website."""
import csv
import os

from berkeleytime.config.general import SPECIAL_CHARACTER_ABBREVIATIONS
from mondaine.service.definition.mapper import MapperDefinition

def handler(csv_rel_path):
    csv_path = os.path.join(os.path.dirname(__file__), csv_rel_path)  # noqa
    csv_file = open(csv_path, 'rb')

    """Parse the csv and return a single breadth definition."""
    definition = MapperDefinition()

    # Iterate through each department, create a DepartmentDefinition
    # and add it to the final definition
    curr_csv = csv.reader(csv_file)
    current_abbreviation = ""
    allowed = []
    for line in curr_csv:
        if len(line) == 2:
            abbreviation = line[0]
            course_number = line[1]
            if current_abbreviation != "" and abbreviation != current_abbreviation:
                definition.add(
                    abbreviation=_normalize_abbreviation(current_abbreviation), # abbreviation as a string
                    allowed=allowed  # list of course_numbers
                )
                allowed = []

            current_abbreviation = abbreviation
            allowed.append(course_number)

    # Add the last department and all of its allowed courses
    definition.add(
        abbreviation=_normalize_abbreviation(current_abbreviation),  # abbreviation as a string
        allowed=allowed  # list of course_numbers
    )

    return definition

def _normalize_abbreviation(abbreviation):
    """Return the abbreviation with special characters (if it has them)"""
    return SPECIAL_CHARACTER_ABBREVIATIONS.get(abbreviation, abbreviation)
