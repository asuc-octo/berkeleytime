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

    is_primary = models.BooleanField(default=False)

    # Do not ever change manually set these fields!
    # They are duplicated here by enrollment_store to optimize queries
    enrolled = models.IntegerField(null=True)
    enrolled_max = models.IntegerField(null=True)
    waitlisted = models.IntegerField(null=True)
    waitlisted_max = models.IntegerField(null=True)

    textbooks = models.ManyToManyField(Textbook)

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