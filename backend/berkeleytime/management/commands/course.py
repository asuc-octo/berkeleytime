"""Update canonical course data, run nightly.

Pull data from SIS Course API to update our database.
Information pertains to a canonical course across semesters.
"""
from django.core.management.base import BaseCommand

from catalog.service import course_service


class Command(BaseCommand):
    """python manage.py course."""

    def add_arguments(self, parser):
        parser.add_argument(
            '--page-number',
            action='store',
            default=0,
            help="Page number for paged course update",
        )
        parser.add_argument(
            '--page-size',
            action='store',
            default=100,
            help="Number of courses per page",
        )


    def handle(self, *args, **options):
        print('Running python3 manage.py course')
        course_service.update(
            page_number=options['page_number'],
            page_size=options['page_size']
        )
