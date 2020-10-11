from django.db import models
from catalog.models import Section
import datetime


class Enrollment(models.Model):
    '''A single enrollment data point for a single section.'''

    class Meta:
        db_table = 'catalog_enrollment'
        unique_together = ('section', 'date_created',)

    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)

    enrolled = models.IntegerField(null=True)
    enrolled_max = models.IntegerField(null=True)
    waitlisted = models.IntegerField(null=True)
    waitlisted_max = models.IntegerField(null=True)