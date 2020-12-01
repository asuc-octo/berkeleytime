"""Grade Service."""
import csv
import os
import sys

import grades.resource
from catalog.models import Course
from grades.mapper import raw_grade_mapper, formatted_grade_mapper
from grades.models import Grade

class GradeService:
    """Application logic for grade data."""

    formatted_headers = [
        'Abbreviation', 'CourseNum', 'CCN', 'SectionNum', 'CourseDesc', 'Instructor', 'Level',
        'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'NP'
    ]

    def translate(self, semester=None, year=None, skip_broken=False):
        unknown = set()

        if semester and year:
            self._translate_one(semester, year, skip_broken, unknown)
        else:
            for filename in os.listdir(os.path.join(os.path.dirname(grades.resource.__file__), 'raw/')):
                semester, year, grad = filename.split('_')
                self._translate_one(semester, year, skip_broken, unknown)

        if len(unknown) > 0 and not skip_broken:
            print(
                f'----------------------- WARNING --------------------------------------------------\n'
                f'There are {len(unknown)} subjects that could not be translated into abbreviations.\n'
                f'Please fix them in playlists/utils/config/abbreviation.yaml before continuing,\n'
                f'or turn on --skip-broken to skip adding those classes to the formatted csv.\n'
                f'----------------------------------------------------------------------------------'
            )
            for i, dept in enumerate(unknown):
                print(f'{i}) ', dept)


    def _translate_one(self, semester, year, skip_broken, unknown):
        undergrad_courses, undergrad_unknown_departments = raw_grade_mapper.map(
            f'{semester}_{year}_under.csv', extras={'Level': 'under'}
        )
        grad_courses, grad_unknown_departments = raw_grade_mapper.map(
            f'{semester}_{year}_grad.csv', extras={'Level': 'grad'}
        )

        formatted_path = os.path.join(os.path.dirname(grades.resource.__file__), f'formatted/{semester}_{year}.csv')
        with open(formatted_path, 'w') as formatted_csv_file:
            writer = csv.DictWriter(
                formatted_csv_file,
                fieldnames=GradeService.formatted_headers,
                restval=0,
                extrasaction='ignore'
            )
            writer.writeheader()
            for course in undergrad_courses + grad_courses:
                if skip_broken and course['subject'] == 'UNKNOWN':
                    continue
                writer.writerow(course)

        unknown.update(undergrad_unknown_departments)
        unknown.update(grad_unknown_departments)


    def update(self, semester=None, year=None):
        if semester and year:
            self._update_one(semester, year)
        else:
            for filename in os.listdir(os.path.join(os.path.dirname(grades.resource.__file__), 'formatted/')):
                filename = filename.split('.')[0]
                semester, year = filename.split('_')
                self._update_one(semester, year)


    def _update_one(self, semester, year):
        grade_dicts = formatted_grade_mapper.map(
            f'{semester}_{year}.csv', extras={'semester': semester, 'year': year}
        )

        for grade_dict in grade_dicts:
            course = Course.objects.filter(
                abbreviation=grade_dict['abbreviation'],
                course_number=grade_dict['course_number'],
            ).first()

            if course:
                grade_dict['course_id'] = course.id
                grade_obj, created = self.update_or_create_from_dict(grade_dict)
                print({
                    'message': 'Updated grade record',
                    'grade': grade_obj,
                })
            else:
                print({
                    'message': 'Course not found while updating grades',
                    'grade_dict': grade_dict,
                }, file=sys.stderr)


    def update_or_create_from_dict(self, grade_dict):
        return Grade.objects.update_or_create(
            course_id=grade_dict['course_id'],
            semester=grade_dict['semester'],
            year=grade_dict['year'],
            section_number=grade_dict['section_number'],
            defaults=grade_dict,
        )


grade_service = GradeService()
