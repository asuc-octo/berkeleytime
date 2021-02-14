from django.db import models

import arrow


class Course(models.Model):
    """A single course (e.g. COMP SCI 61A)."""

    class Meta:
        db_table = 'course'
        unique_together = ('abbreviation', 'course_number')

    _derived_grade_fields = (
        'grade_average', 'letter_average',
    )

    _derived_enrollment_fields = (
        'enrolled', 'enrolled_max', 'waitlisted', 'enrolled_percentage',
        'open_seats',
    )

    title = models.CharField(max_length=1024)
    department = models.CharField(max_length=150)
    abbreviation = models.CharField(max_length=20)
    course_number = models.CharField(max_length=10)
    description = models.TextField()
    units = models.CharField(max_length=20)
    cross_listing = models.ManyToManyField('self')

    prerequisites = models.TextField()

    # Denormalized from Grades for performance, do not change manually
    grade_average = models.FloatField(null=True, default=-1)
    letter_average = models.CharField(max_length=2)

    # Denormalized from Enrollment for performance, do not change manually
    has_enrollment = models.BooleanField(default=False)
    enrolled = models.IntegerField(default=-1)
    enrolled_max = models.IntegerField(default=-1)
    enrolled_percentage = models.FloatField(default=-1)
    waitlisted = models.IntegerField(default=-1)
    open_seats = models.IntegerField(default=-1)

    last_updated = models.DateTimeField(auto_now=True)

    def as_json(self):
      return dict(
        id = self.id,
        title = self.title,
        department = self.department,
        abbreviation = self.abbreviation,
        course_number = self.course_number,
        description = self.description,
        units = self.display_units,
        prerequisites = self.prerequisites,
        grade_average = self.grade_average,
        letter_average = self.letter_average,
        enrolled = self.enrolled,
        enrolled_max = self.enrolled_max,
        enrolled_percentage = self.enrolled_percentage,
        waitlisted = self.waitlisted,
      )

    def __repr__(self):
        """Return representation of Course model."""
        return f'Course(abbrev={self.abbreviation}, course_number={self.course_number})'

    def __str__(self):
        return self.__repr__()

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

    class Meta:
        db_table = 'section'
        indexes = [
            models.Index(fields=['abbreviation', 'course_number']),
            models.Index(fields=['kind']),
            models.Index(fields=['disabled']),
            models.Index(fields=['is_primary']),
        ]

    _derived_enrollment_fields = (
        'enrolled', 'enrolled_max', 'waitlisted', 'waitlisted_max',
    )

    # Passed in from Course attributes
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    abbreviation = models.CharField(max_length=20)
    course_number = models.CharField(max_length=20)
    year = models.CharField(max_length=4)
    semester = models.CharField(max_length=20)

    # Pulled from SIS Class API
    course_title = models.CharField(max_length=200)
    section_number = models.CharField(max_length=20)
    ccn = models.CharField(max_length=50)
    kind = models.CharField(max_length=100)
    is_primary = models.BooleanField(default=False)
    associated_sections = models.ManyToManyField('self')

    days = models.CharField(max_length=20)
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)

    final_day = models.CharField(max_length=1)
    final_end = models.DateTimeField(null=True)
    final_start = models.DateTimeField(null=True)

    instructor = models.CharField(max_length=300)

    disabled = models.BooleanField(default=False)

    location_name = models.CharField(max_length=300)

    instruction_mode = models.CharField(max_length=128)

    last_updated = models.DateTimeField(auto_now=True)

    # Denormalized from Enrollment for performance, do not change manually
    enrolled = models.IntegerField(null=True)
    enrolled_max = models.IntegerField(null=True)
    waitlisted = models.IntegerField(null=True)
    waitlisted_max = models.IntegerField(null=True)

    def as_json(self):
      return dict(
        id = self.id,
        section_number = self.section_number,
        ccn = self.ccn,
        kind = self.kind,

        word_days = self.word_days if self.days else '',
        start_time = self.format_time(self.start_time),
        end_time = self.format_time(self.end_time),

        final_day = self.final_word_day,
        final_start = self.format_time(self.final_start),
        final_end = self.format_time(self.final_end),

        instructor = self.instructor,
        location_name = self.location_name,

        waitlisted = self.waitlisted,
        waitlisted_max = self.waitlisted_max,
        enrolled = self.enrolled,
        enrolled_max = self.enrolled_max,
      )

    @property
    def word_days(self):
        word = ''
        days = {'0': 'Su', '1': 'M', '2': 'Tu', '3': 'W', '4': 'Th', '5': 'F', '6': 'Sa', '7': 'Su'}
        for integer in self.days:
            word += days[integer]
        return word

    @property
    def final_word_day(self):
        days = {'0': 'Su', '1': 'M', '2': 'Tu', '3': 'W', '4': 'Th', '5': 'F', '6': 'Sa', '7': 'Su'}
        return days[self.final_day] if self.final_day else ''

    def format_time(self, dt):
        if not dt:
            return ''

        return arrow.get(dt).to(tz='US/Pacific').naive.isoformat()

    def __repr__(self):
        """Return representation of Section model."""
        return f'Section(abbrev={self.abbreviation}, course_number={self.course_number}, ' \
               f'semester={self.semester}, year={self.year}, ' \
               f'kind={self.kind}, section_number={self.section_number})'

    def __str__(self):
        return self.__repr__()
