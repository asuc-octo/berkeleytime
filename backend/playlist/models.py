from django.db import models
from catalog.models import Course
from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR

class Playlist(models.Model):
    """A collection of courses."""

    class Meta:
        db_table = 'playlist'

    category = models.CharField(max_length=255, default='custom')
    name = models.CharField(max_length=255)
    semester = models.CharField(max_length=50, default=CURRENT_SEMESTER)
    year = models.CharField(max_length=4, default=CURRENT_YEAR)

    courses = models.ManyToManyField(Course)

    def as_json(self):
        return dict(
            id=self.id,
            name=self.name,
            category=self.category,
            semester=self.semester,
            year=self.year
        )

    def __repr__(self):
        """Return str representation of Playlist model."""
        return f'Playlist(name={self.name})'

    def __str__(self):
        return self.__repr__()