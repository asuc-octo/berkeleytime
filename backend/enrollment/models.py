from django.db import models
from catalog.models import Section
import datetime


class Enrollment(models.Model):
    """A single enrollment data point for a single section."""

    class Meta:
        db_table = 'catalog_enrollment'
        # Only one Enrollment can exist for a single section each day.
        unique_together = ('section', 'date_created',)

    section = models.ForeignKey(Section, on_delete=models.CASCADE)

    enrolled = models.IntegerField(null=True)
    enrolled_max = models.IntegerField(null=True)
    waitlisted = models.IntegerField(null=True)
    waitlisted_max = models.IntegerField(null=True)
    date_created = models.DateTimeField(auto_now_add=True)