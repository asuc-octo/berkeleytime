from django.db import models
from catalog.models import Course


class Grade(models.Model):
    """Represents a distribution of grades for a given Course."""

    class Meta:
        db_table = 'grade'

    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    semester = models.CharField(max_length=50)
    year = models.CharField(max_length=4)
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
    graded_total = models.IntegerField()
    p = models.IntegerField(null=True)
    np = models.IntegerField(null=True)
    average = models.FloatField()

    def __repr__(self):
        """Return str representation of Grade model."""
        return f'Grade(abbrev={self.abbreviation}, course_number={self.course_number}, ' \
               + f'section_number={self.section_number}, semester={self.semester}, ' \
               + f'year={self.year}, average={self.average})'