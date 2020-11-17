"""Update grade data, run once a semester."""
from django.core.management.base import BaseCommand

from grades.service import grade_service


class Command(BaseCommand):
    """python manage.py grade [--semester] [--year]."""

    def add_arguments(self, parser):
        parser.add_argument(
            '--semester',
            action='store',
            help="Semester for which to update grades (e.g. fall)",
        )
        parser.add_argument(
            '--year',
            action='store',
            help="Year for which to update grades (e.g. 2020)",
        )


    def handle(self, *args, **options):
        semester, year = options['semester'], options['year']
        if (semester and not year) or (not semester and year):
            print("Must pass either no arguments or semester + year")
            return

        grade_service.update(semester=semester, year=year)
