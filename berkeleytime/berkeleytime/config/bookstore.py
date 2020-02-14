"""Cal student bookstore related settings.

These settings need to be separate from general and ongoing because the
bookstore operates on a different schedule than the catalog of classes, i.e.
the schedule of classes could be updated but the bookstore doesn't have data
for the new semester yet. This is generally the case for the first part of
every semester.

Every time the bookstore updates, this file will need to be updated. For more
info see https://github.com/yuxinzhu/campanile/wiki/New-Semester-Runbook
"""
from semesters import spring2020 as current_bookstore_semester_settings

BOOKSTORE_SEMESTER = current_bookstore_semester_settings.CURRENT_SEMESTER
BOOKSTORE_YEAR = current_bookstore_semester_settings.CURRENT_YEAR
