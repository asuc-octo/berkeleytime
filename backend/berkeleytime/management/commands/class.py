"""Update class data, run nightly.

Pull data from SIS Class API to update our database.
Information includes sections, enrollments, etc.
"""
from django.core.management.base import BaseCommand

from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR
from catalog.service import section_service


class Command(BaseCommand):
    """python manage.py class [--semester] [--year] [--abbreviation] [--course_number]."""

    def add_arguments(self, parser):
        parser.add_argument(
            '--semester',
            action='store',
            default=CURRENT_SEMESTER,
            help="Semester for which to update sections (e.g. fall)",
        )
        parser.add_argument(
            '--year',
            action='store',
            default=CURRENT_YEAR,
            help="Year for which to update sections (e.g. 2020)",
        )
        parser.add_argument(
            '--abbreviation',
            action='store',
            help="Abbreviation for which to update sections (e.g. COMPSCI)",
        )
        parser.add_argument(
            '--course-number',
            action='store',
            help="Course number for which to update sections (e.g. 61A)",
        )


    def handle(self, *args, **options):
        print('Running python3 manage.py class')
        section_service.update(
            semester=options['semester'],
            year=options['year'],
            abbreviation=options['abbreviation'],
            course_number=options['course_number'],
        )
