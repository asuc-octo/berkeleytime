"""Schedule management command."""
from django.core.management.base import BaseCommand
from optparse import make_option
from data.service.reader.grades.writer import translate

class Command(BaseCommand):
    """python manage.py translate-grades."""

    option_list = BaseCommand.option_list + (
        make_option(
            '--skip-broken',
            action='store_true',
            dest='skip',
            default=False,
            help='Does not write courses that cannot be matched to an existing department',
        ),
    )

    def handle(self, *args, **options):
        """Command handler."""
        translate(options["skip"])
