"""Write all Enrollment objects for a given semester to CSV."""
import csv

from django.core.management.base import BaseCommand

from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR
from catalog.models import *


class Command(BaseCommand):
    """python manage.py enrollment_output <semester> <year>."""

    def add_arguments(self, parser):
        parser.add_argument(
            'semester',
            action='store',
            default=CURRENT_SEMESTER,
            help="Semester for which to write enrollments (e.g. fall)",
        )
        parser.add_argument(
            'year',
            action='store',
            default=CURRENT_YEAR,
            help="Year for which to write enrollments (e.g. 2020)",
        )


    def handle(self, *args, **options):
        semester, year = options['semester'], options['year']
        filename = '%s_%s_enrollment' % (semester, year)
        with open(filename, 'wb') as output_file:
            w = csv.writer(output_file, delimiter=',')
            w.writerow([
                'abbreviation',
                'course_number',
                'kind',
                'section_number',
                'ccn',
                'semester',
                'year',
                'date',
                'enrolled',
                'enrolled_max',
                'waitlisted'
            ])
            enrollment_data = Enrollment.objects.filter(semester=semester, year=year)
            for i, entry in enumerate(enrollment_data):
                print(round((i + 1) / float(len(enrollment_data)) * 100, 2), '%')
                row = [
                    entry.section.abbreviation,
                    entry.section.course_number,
                    entry.section.kind,
                    entry.section.section_number,
                    entry.section.ccn,
                    entry.section.semester,
                    entry.section.year,
                    entry.date_created.strftime('%m/%d/%Y'),
                    str(entry.enrolled),
                    str(entry.enrolled_max),
                    str(entry.waitlisted),
                ]
                w.writerow(row)
