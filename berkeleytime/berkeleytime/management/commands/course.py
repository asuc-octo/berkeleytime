"""Course management command."""

from django.contrib.admin import ModelAdmin, actions # noqa

from django.core.management.base import BaseCommand
from catalog.job.course import course_job


class Command(BaseCommand):
    """python manage.py course."""

    def handle(self, *args, **options):
        """Command handler."""
        start_index = 0 if not args else int(args[0])

        course_job.update(start_index=start_index)
