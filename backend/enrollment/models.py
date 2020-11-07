from django.db import models
from catalog.models import Section


class Enrollment(models.Model):
    """A single enrollment data point for a single section."""

    class Meta:
        db_table = 'enrollment'
        unique_together = ('section', 'date_created',)

    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    date_created = models.DateTimeField()

    enrolled = models.IntegerField(null=True)
    enrolled_max = models.IntegerField(null=True)
    waitlisted = models.IntegerField(null=True)
    waitlisted_max = models.IntegerField(null=True)