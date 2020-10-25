"""Mapper for converting formatted grade CSV files into dictionaries."""
import csv
import os

import nameparser

import grades.resource
from grades.utils import letter_grade_to_field_name
from playlist.utils import utils

class FormattedGradeMapper:

    def map(self, filename, extras={}):
        grade_dicts = []

        # Read from formatted grade CSV files
        filepath = os.path.join(os.path.dirname(grades.resource.__file__), f'formatted/{filename}')
        with open(filepath, 'r') as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                grade_dict = self._map_row_to_section_info(row)
                grade_dict.update(self._map_row_to_instructor_names(row))
                grade_dict.update(self._map_row_to_grades(row))
                grade_dict.update(extras)

                grade_dicts.append(grade_dict)

        return grade_dicts


    def _map_row_to_section_info(self, row):
        return {
            'abbreviation': row['Abbreviation'],
            'course_number': row['CourseNum'],
            'section_number': row['SectionNum'],
        }


    def _map_row_to_instructor_names(self, row):
        instructor_names = row['Instructor'].split(';')

        instructor_names_formatted = []
        for name in instructor_names:
            formatted_name = nameparser.HumanName(name)
            instructor_names_string.append(f'{formatted_name.last.upper()}, {formatted_name.first.upper()[0]}')

        return {
            'instructor': ('; ').join(instructor_names_formatted)
        }


    def _map_row_to_grades(self, row):
        result = {}
        total_gpa, total_letter_grades = 0, 0

        for key, value in row:
            # If column is not a grade, continue
            if len(key) > 2:
                continue

            value = int(value)
            result[key] = value

            if key not in ['P', 'NP']:
                total_gpa += float(value * letter_grade_to_gpa(key))
                total_letter_grades += value

        if total_letter_grades != 0:
            result['average'] = total_gpa / total_letter_grades

        result['graded_total'] = total_letter_grades

        return result


formatted_grade_mapper = FormattedGradeMapper()