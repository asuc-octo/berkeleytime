"""Do not put any application logic in this file."""
from __future__ import division
import datetime

from django.db import models

# TODO (Yuxin) This should be deprecated
from campus.models import Room
from marketplace.models import Textbook

from berkeleytime.settings import CURRENT_YEAR
from berkeleytime.settings import CURRENT_SEMESTER
from raven.contrib.django.raven_compat.models import client  # noqa


class Course(models.Model):
    """A single course (e.g. COMP SCI 61A)."""

    _derived_grade_fields = (
        'grade_average', 'letter_average',
    )

    _derived_enrollment_fields = (
        'enrolled', 'enrolled_max', 'waitlisted', 'enrolled_percentage',
        'open_seats',
    )

    _derived_playlist_fields = ('favorite_count',)

    title = models.CharField(max_length=1024, null=True, blank=True)
    department = models.CharField(max_length=150, null=True, blank=True)
    abbreviation = models.CharField(max_length=20, null=True, blank=True)
    course_number = models.CharField(max_length=10, null=True, blank=True)
    units = models.CharField(max_length=1024, null=True, blank=True)
    hours = models.CharField(max_length=1024, null=True, blank=True)
    cs_course_id = models.CharField(max_length=1024, null=True, blank=True)

    grading = models.CharField(max_length=1024, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    previously = models.CharField(max_length=1024, null=True, blank=True)
    final_exam_status = models.CharField(max_length=1024, null=True, blank=True)  # noqa
    credit_restrictions = models.CharField(max_length=1024, null=True, blank=True)  # noqa

    primary_kind = models.CharField(max_length=20, null=True, blank=True)
    favorite_count = models.IntegerField(default=0)

    prerequisites = models.TextField(null=True, blank=True)

    # Do not ever change manually set these fields!
    # They are duplicated here by grade_store to optimize queries
    grade_average = models.FloatField(null=True, default=-1)
    letter_average = models.CharField(max_length=2, null=True, blank=True)

    # Do not ever change manually set these fields!
    # They are duplicated here by enrollment_store to optimize queries
    enrolled_percentage = models.FloatField(default=-1)
    open_seats = models.IntegerField(default=-1)
    enrolled = models.IntegerField(default=-1)
    enrolled_max = models.IntegerField(default=-1)
    waitlisted = models.IntegerField(default=-1)

    has_enrollment = models.BooleanField(default=False)

    last_updated = models.DateTimeField(auto_now=True)

    def as_json(self):
      return dict(
        id = self.id,
        title = self.title,
        abbreviation = self.abbreviation,
        course_number = self.course_number,
        department = self.department,
        description = self.description,
        enrolled = self.enrolled,
        enrolled_max = self.enrolled_max,
        enrolled_percentage = self.enrolled_percentage,
        waitlisted = self.waitlisted,
        letter_average = self.letter_average,
        grade_average = self.grade_average,
        units = self.display_units,
        prerequisites = self.prerequisites,
      )

    class Meta:
        """Metaclass for Course model."""

        unique_together = ('abbreviation', 'course_number')

    def __unicode__(self):
        """Return unicode representation of models.Course."""
        return self.abbreviation + ' ' + self.course_number

    @property
    def display_units(self):
        """Unit string for display in the third column."""
        separator = None
        if '-' in self.units:
            separator = '-'
        if 'or' in self.units:
            separator = 'or'
        if separator:
            try:
                first, second = map(
                    lambda u: int(float(u.strip())),
                    self.units.split(separator)
                )
                return '{}-{}'.format(first, second)
            except ValueError:
                return self.units
        return self.units


class Section(models.Model):
    """A single section (COMPSCI 61A Discussion 101 Fall 2016)."""

    _derived_enrollment_fields = (
        'enrolled', 'enrolled_max', 'waitlisted', 'waitlisted_max',
    )

    abbreviation = models.CharField(max_length=20, null=True, blank=True)
    course_number = models.CharField(max_length=20, null=True, blank=True)

    year = models.CharField(max_length=4, null=True, blank=True)
    semester = models.CharField(max_length=20, null=True, blank=True)

    ccn = models.CharField(max_length=50, null=True, blank=True)
    course = models.ForeignKey(Course)

    course_title = models.CharField(max_length=200, null=True, blank=True)
    days = models.CharField(max_length=20, null=True, blank=True)
    disabled = models.BooleanField(default=False)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    final_end = models.DateTimeField(null=True, blank=True)
    final_start = models.DateTimeField(null=True, blank=True)
    final_day = models.CharField(max_length=1, null=True, blank=True)
    instructor = models.CharField(max_length=300, null=True, blank=True)
    kind = models.CharField(max_length=100, null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    location_name = models.CharField(max_length=300, null=True, blank=True)
    note = models.TextField(null=True)

    # rank: this is the order the section appears on the schedule.berkeley.edu
    rank = models.IntegerField(null=True)

    # noqa
    related = models.ManyToManyField("self", null=True)
    restrictions = models.TextField(null=True)
    section_number = models.CharField(max_length=20, null=True, blank=True)

    standard_location = models.ForeignKey(Room, blank=True, null=True, on_delete=models.SET_NULL)  # noqa
    suffix = models.CharField(max_length=5, null=True, blank=True)
    units = models.CharField(max_length=50, null=True, blank=True)
    instruction_mode = models.CharField(max_length=128, null=True, blank=True)

    is_primary = models.BooleanField(default=False)

    # Do not ever change manually set these fields!
    # They are duplicated here by enrollment_store to optimize queries
    enrolled = models.IntegerField(null=True)
    enrolled_max = models.IntegerField(null=True)
    waitlisted = models.IntegerField(null=True)
    waitlisted_max = models.IntegerField(null=True)

    textbooks = models.ManyToManyField(Textbook)

    def as_json(self):
      return dict(
        id = self.id,
        enrolled = self.enrolled,
        enrolled_max = self.enrolled_max,
        section_number = self.section_number,
        ccn = self.ccn,
        kind = self.kind,
        start_time = self.start_time,
        end_time = self.end_time,
        word_days = self.word_days,
        location_name = self.location_name,
        instructor = self.instructor,
        waitlisted = self.waitlisted,
        final_day = self.final_day,
        final_word_day = self.final_word_day,
        final_start = self.final_start,
        final_end = self.final_end,
      )

    @property
    def info(self):  # noqa
        """TODO (Yuxin) This should be deprecated. This seems like its used in campus"""  # noqa
        course = self.abbreviation + " " + self.course_number
        section = "(" + self.kind + " " + self.section_number + ")"
        return (course + " " + section + " " + self.instructor).strip()

    @property
    def word_days(self):
        word = ""
        # Right now both 0 and 7 map to Su. 0 is now the canonical number representing Sunday in the database
        # 7 is included for backwards compatibility
        days = {"0": "Su", "1": "M", "2": "Tu", "3": "W", "4": "Th", "5": "F", "6": "Sa", "7": "Su"}  # noqa
        for integer in self.days:
            word += days[integer]
        return word

    @property
    def final_word_day(self):
        days = {"0": "Su", "1": "M", "2": "Tu", "3": "W", "4": "Th", "5": "F", "6": "Sa", "7": "Su"}  # noqa
        return days[self.final_day]

    def __unicode__(self):
        """Return unicode representation of models.Section."""
        return self.abbreviation + self.course_number + '-' + self.kind

class Enrollment(models.Model):
    """A single enrollment data point for a single section."""

    section = models.ForeignKey(Section)

    enrolled = models.IntegerField(null=True)
    enrolled_max = models.IntegerField(null=True)
    waitlisted = models.IntegerField(null=True)
    waitlisted_max = models.IntegerField(null=True)
    date_created = models.DateTimeField(default=datetime.datetime.now())

    class Meta:  # noqa
        """Only one Enrollment can exist for a single section each day."""
        unique_together = ('section', 'date_created',)


class Grade(models.Model):
    """Represents a distribution of grades for a given Course."""

    course = models.ForeignKey(Course)
    semester = models.CharField(max_length=50)
    year = models.CharField(max_length=4)
    department = models.CharField(max_length=200)
    abbreviation = models.CharField(max_length=50)
    course_number = models.CharField(max_length=100)
    section_number = models.CharField(max_length=100)
    instructor = models.CharField(max_length=200)
    a1 = models.IntegerField()
    a2 = models.IntegerField()
    a3 = models.IntegerField()
    b1 = models.IntegerField()
    b2 = models.IntegerField()
    b3 = models.IntegerField()
    c1 = models.IntegerField()
    c2 = models.IntegerField()
    c3 = models.IntegerField()
    d1 = models.IntegerField()
    d2 = models.IntegerField()
    d3 = models.IntegerField()
    f = models.IntegerField()
    total = models.IntegerField()
    p = models.IntegerField(null=True)
    np = models.IntegerField(null=True)
    incomplete = models.IntegerField(null=True)
    average = models.FloatField()
    letter_average = models.CharField(max_length=2, default='')

    def __unicode__(self):
        """Return unicode representation of models.Grade."""
        return u'%s (%s)' % (self.average, self.letter_average)


class Playlist(models.Model):
    """A collection of courses."""

    user = models.ForeignKey('account.BerkeleytimeUserProfile', null=True)

    # bind a schedule to a user_email
    # max length of an email field is 254 characters
    # to be complaint with RFCs 3696 and 5321
    user_email = models.EmailField(null=True, blank=True)

    category = models.CharField(max_length=255, default='custom')
    name = models.CharField(max_length=255)
    semester = models.CharField(max_length=50, default=CURRENT_SEMESTER)
    year = models.CharField(max_length=4, default=CURRENT_YEAR)

    courses = models.ManyToManyField(Course)

    def __unicode__(self):
        """Return unicode representation of models.Playlist."""
        return u'(Playlist) %s' % self.name

    def as_json(self):
        return dict(
            id=self.id,
            name=self.name,
            category=self.category,
            semester=self.semester,
            year=self.year
        )


class UpdateLog(models.Model):
    """Update log for debugging."""

    started = models.BooleanField(default=True)
    finished = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    message = models.CharField(max_length=1024, null=True, blank=True)
    semester = models.CharField(max_length=50, default=CURRENT_SEMESTER)
    year = models.CharField(max_length=4, default=CURRENT_YEAR)
