"""Grade management command."""
from django.core.management.base import BaseCommand
from data.service.grade import grade_service

# This import is a hack since with Django 1.6 there's an odd circular import
# error ('cannot import name actions') when django tries to import these modules
# like four levels down. This error only happens when running management
# commands. When we upgrade to Django 1.7+, we might be able to remove this.
# See https://stackoverflow.com/questions/24186814/importerror-cannot-import-name-actions
from django.contrib.admin import ModelAdmin, actions # noqa


class Command(BaseCommand):
    """python manage.py grade <semester?> <year?>."""

    def handle(self, *args, **options):
        """Command handler."""
        if len(args) not in [0, 2]:
            raise ValueError({
                'message': 'Must pass either no arguments or semester/year',
            })

        semester, year = (args[0], args[1]) if len(args) == 2 else (None, None)
        grade_service.update(semester=semester, year=year)
