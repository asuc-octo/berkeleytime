"""Course management command."""

# This import is a hack since with Django 1.6 there's an odd circular import
# error ('cannot import name actions') when django tries to import these modules
# like four levels down. This error only happens when running management
# commands. When we upgrade to Django 1.7+, we might be able to remove this.
# See https://stackoverflow.com/questions/24186814/importerror-cannot-import-name-actions
from django.contrib.admin import ModelAdmin, actions # noqa

from django.core.management.base import BaseCommand
from catalog.job.course import course_job


class Command(BaseCommand):
    """python manage.py course."""

    def handle(self, *args, **options):
        """Command handler."""
        start_index = 0 if not args else int(args[0])

        course_job.update(start_index=start_index)
