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

    def __str__(self):
        """Return str representation of models.Playlist."""
        return f'(Playlist) {self.name}'

    def as_json(self):
        return dict(
            id=self.id,
            name=self.name,
            category=self.category,
            semester=self.semester,
            year=self.year
        )