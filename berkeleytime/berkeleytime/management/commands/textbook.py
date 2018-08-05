"""Textbook management command."""

# This import is a hack since with Django 1.6 there's an odd circular import
# error ('cannot import name actions') when django tries to import these modules
# like four levels down. This error only happens when running management
# commands. When we upgrade to Django 1.7+, we might be able to remove this.
# See https://stackoverflow.com/questions/24186814/importerror-cannot-import-name-actions
from django.contrib.admin import ModelAdmin, actions # noqa

from django.core.management.base import BaseCommand
from marketplace.job.textbook import textbook_job
from optparse import make_option
from django.conf import settings


class Command(BaseCommand):
    """python manage.py textbook.

    Fetches and persists textbooks for the given semester and links them to
    their relevant sections.
    """

    option_list = BaseCommand.option_list + (
        make_option(
            '--semester',
            action='store',
            dest='semester',
            default=settings.BOOKSTORE_SEMESTER,
            help='Semester to update sections for (fall, spring, summer)',
        ),
        make_option(
            '--year',
            action='store',
            dest='year',
            default=settings.BOOKSTORE_YEAR,
            help='Year to update sections for (e.g. "2017")',
        ),
        make_option(
            '--abbreviation',
            action='store',
            dest='abbreviation',
            default=None,
            help='Abbreviation to update sections for, e.g. "COMPSCI". If not provided, grabs textbooks for all courses.', # noqa
        ),
        make_option(
            '--start-index',
            action='store',
            dest='start',
            default=None,
            help='Index in alphabetically sorted list of abbreviations to start with.', # noqa
        )
    )

    def handle(self, *args, **options):
        """Command handler."""
        if not settings.AMAZON_AFFILIATE_TAG:
            print {
                'message': 'Amazon affiliate tag not set, please setup Amazon affiliate account before running this script',  # noqa
                'amazon_affiliate_tag': settings.AMAZON_AFFILIATE_TAG,
            }
            return

        try:
            start = int(options['start'])
        except TypeError:
            start = 0
        textbook_job.update(
            semester=options['semester'],
            year=options['year'],
            abbreviation=options['abbreviation'],
            start=start,
        )
