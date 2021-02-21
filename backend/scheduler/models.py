import pytz

from django.db import models
from django.db.models.deletion import CASCADE
from catalog.models import Course, Section
from user.models import BerkeleytimeUser


# list of all timezones
TIMEZONES = tuple(zip(pytz.all_timezones, pytz.all_timezones))

SEMESTER_CHOICES = [
        ('FA', 'fall'),
        ('SP', 'spring'),
        ('SU', 'summer')
    ]


class Schedule(models.Model):
    # meta
    user = models.ForeignKey(
        BerkeleytimeUser,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    name = models.CharField(max_length=32)
    year = models.CharField(max_length=4)
    semester = models.CharField(max_length=2, choices=SEMESTER_CHOICES)
    timezone = models.CharField(max_length=32, choices=TIMEZONES, default='America/Los_Angeles')
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    # content
    classes = models.ManyToManyField(Course)
    selected_sections = models.ManyToManyField(Section)
    total_units = models.PositiveSmallIntegerField() # [0, 32767]
    # don't think anyone is going to have more than 32767 units lol

    # foreign keys: schedule.timeblocks


class TimeBlock(models.Model):
    """ A time block without classes that the user
    can define when creating a schedule. """
    name = models.CharField(max_length=32)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    days = models.CharField(max_length=7)
    schedule = models.ForeignKey(
        Schedule,
        on_delete=CASCADE,
        related_name='timeblocks'
    )
