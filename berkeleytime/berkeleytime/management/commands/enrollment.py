from django.core.management.base import BaseCommand
from catalog.models import *
import csv

#
# Running This Script
# $ python manage.py enrollment <SEMESTER> <YEAR>
#
# DO NOT run this script on heroku. Instead, follow the instructions here:
# https://github.com/yuxinzhu/campanile/wiki/Berkeleytime-Enrollment-Data-CSV-Generation-Protocol
#


def write(filename, rows):
    with open(filename, 'wb') as output_file:
        w.writerows([["abbreviation", "course_number", "ccn", "semester", "year",
                      "date", "enrolled", "enrolled_max", "waitlisted"]] + rows)


class Command(BaseCommand):

    def handle(self, *args, **options):
        semester, year = args[0], args[1]
        filename = "%s_%s_enrollment" % (semester, year)
        with open(filename, 'wb') as output_file:
            w = csv.writer(output_file, delimiter=",")
            w.writerow(["abbreviation", "course_number", "kind", "section_number", "ccn",
                        "semester", "year", "date", "enrolled", "enrolled_max", "waitlisted"])
            enrollment_data = Enrollment.objects.filter(semester=semester, year=year)
            print len(enrollment_data)
            count = 1
            for entry in enrollment_data:
                print round(count / float(len(enrollment_data)) * 100, 2), '%'
                row = [
                    # Section information from models.py, `class Section`
                    entry.section.abbreviation,
                    entry.section.course_number,
                    entry.section.kind,
                    entry.section.section_number,
                    entry.section.ccn,
                    entry.section.semester,
                    entry.section.year,
                    entry.date_created.strftime("%m/%d/%Y"),
                    str(entry.enrolled),
                    str(entry.enrolled_max),
                    str(entry.waitlisted),
                ]
                count += 1
                w.writerow(row)
