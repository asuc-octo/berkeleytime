"""Update canonical course data, run nightly.

Pull data from SIS Course API to update our database.
Information pertains to a canonical course across semesters.
"""
from django.core.management.base import BaseCommand

from catalog.service import course_service


class Command(BaseCommand):
    """python manage.py course."""

    def handle(self, *args, **options):
        course_service.update(start_index=0)
