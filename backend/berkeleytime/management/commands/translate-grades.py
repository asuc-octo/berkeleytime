"""Preprocess CSV grade data, run once a semester."""
from django.core.management.base import BaseCommand

from grades.service import grade_service

class Command(BaseCommand):
    """python manage.py translate-grades [--skip-broken] [--semester] [--year]."""

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-broken',
            action='store_true',
            help="Does not write courses that cannot be matched to an existing department",
        )
        parser.add_argument(
            '--semester',
            action='store',
            help="Specify a semester",
        )
        parser.add_argument(
            '--year',
            action='store',
            help="Specify a year",
        )


    def handle(self, *args, **options):
        grade_service.translate(
            options['skip-broken'],
            options['semester'],
            options['year']
        )
