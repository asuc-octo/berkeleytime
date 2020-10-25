"""Mapper for converting raw grade CSV files into dictionaries."""
import csv
import os

import grades.resource
from playlist.utils import utils

class RawGradeMapper:

    def map(self, filename, extras={}):
        section_grades = {}
        unknown_departments = set()

        # Read from raw grade CSV files
        filepath = os.path.join(os.path.dirname(grades.resource.__file__), f'raw/{filename}')
        with open(filepath, 'r') as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                section_info_dict = self._map_row_to_section_info_dict(row, unknown_departments)
                grade_dict = self._map_row_to_grade_dict(row)

                grade_key = (section_info_dict['CCN'], section_info_dict['SectionNum'])
                if grade_key not in section_grades:
                    section_grades[grade_key] = section_info_dict

                section_grades[grade_key].update(grade_dict)

        # Rename relevant P/NP columns
        for grade_key, section_grade_dict in section_grades.items():
            pnp_grade_dict = self._map_to_pnp_grade_dict(section_grade_dict)
            section_grade_dict.update(pnp_grade_dict)
            section_grade_dict.update(extras)

        return (
            [grade for grade in section_grades.values() if self._is_large_enough(grade)], unknown_departments
        )


    def _map_row_to_section_info_dict(self, row, unknown_departments):
        abbreviation = utils.department_to_abbreviation(row['Course Subject Short Nm'])
        if not abbreviation:
            abbreviation = 'UNKNOWN'
            unknown_departments.add(row['Course Subject Short Nm'])

        return {
            'Abbreviation': abbreviation,
            'CourseNum': row['Course Number'],
            'CCN': row['Course Control Nbr'],
            'Instructor': row['Instructor Name'],
            'CourseDesc': row['Course Title Nm'],
            'SectionNum': row['Section Nbr'],
        }


    def _map_row_to_grade_dict(self, row):
        return {
            row['Grade Nm']: int(row['Enrollment Cnt'])
        }


    def _map_to_pnp_grade_dict(self, section_grade_dict):
        pnp_grade_dict = {
            'P': 0,
            'NP': 0,
        }

        for k in section_grade_dict:
            if k in ['Pass', 'Satisfactory']:
                pnp_grade_dict['P'] += section_grade_dict[k]
            elif k in ['Not Pass', 'Not Satisfactory']:
                pnp_grade_dict['NP'] += section_grade_dict[k]

        return pnp_grade_dict


    def _is_large_enough(self, section_grade_dict):
        if section_grade_dict['Level'] == 'under':
            privacy_threshold = 10
        else:
            privacy_threshold = 5

        enrollment = 0
        for attribute, value in section_grade_dict.items():
            # If it's a grade attribute
            if len(attribute) <= 2:
                enrollment += value

        for attribute, value in section_grade_dict.items():
            if len(attribute) <= 2 and value == enrollment:
                return False

        return enrollment >= privacy_threshold


raw_grade_mapper = RawGradeMapper()