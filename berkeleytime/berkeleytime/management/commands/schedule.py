"""Schedule management command."""
from django.core.management.base import BaseCommand
from catalog.job.schedule import schedule_job
from optparse import make_option
from django.conf import settings


class Command(BaseCommand):
    """python manage.py schedule."""

    option_list = BaseCommand.option_list + (
        make_option(
            '--semester',
            action='store',
            dest='semester',
            default=settings.CURRENT_SEMESTER,
            help='Semester to update sections for (fall, spring, summer)',
        ),
        make_option(
            '--year',
            action='store',
            dest='year',
            default=settings.CURRENT_YEAR,
            help='Year to update sections for (e.g. "2017")',
        ),
        make_option(
            '--abbreviation',
            action='store',
            dest='abbreviation',
            default=None,
            help='Abbreviation to update sections for, e.g. "COMPSCI"',
        ),
        make_option(
            '--course_number',
            action='store',
            dest='course_number',
            default=None,
            help='Course number to update sections for, e.g. "61A"',
        )
    )

    def handle(self, *args, **options):
        """Command handler."""
        schedule_job.update(
            semester=options['semester'],
            year=options['year'],
            abbreviation=options['abbreviation'],
            course_number=options['course_number'],
        )
