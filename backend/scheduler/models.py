from django.db import models
from django.db.models.deletion import CASCADE
from catalog.models import Course, Section
from user.models import BerkeleytimeUser


class Schedule(models.Model):
    # meta
    user = models.ForeignKey(
        BerkeleytimeUser,
        on_delete=CASCADE,
        related_name='schedules'
    )
    name = models.CharField(max_length=32)
    year = models.CharField(max_length=4)
    semester = models.CharField(max_length=20)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    total_units = models.PositiveSmallIntegerField(default=0)
    # [0, 32767], but don't think anyone is going to have more than 32767 units lol

    # foreign keys: schedule.timeblocks, schedule.selected_sections


class SectionSelection(models.Model):
    """ A section selection stores both the primary and the non-primary (lab/dis)
    sections that the user selects for a certain course. """
    schedule = models.ForeignKey(
        Schedule,
        on_delete=CASCADE,
        related_name="selected_sections")
    course = models.ForeignKey(
        Course,
        on_delete=CASCADE,
        related_name="scheduler_sections"
    )
    primary = models.ForeignKey(
        Section,
        on_delete=CASCADE,
        related_name="scheduler_primary_sections",
        null=True
    )
    secondary = models.ManyToManyField(
        Section,
        related_name="scheduler_secondary_sections"
    )


class TimeBlock(models.Model):
    """ A time block without classes that the user
    can define when creating a schedule. """
    name = models.CharField(max_length=32)
    start_time = models.TimeField()
    end_time = models.TimeField()
    days = models.CharField(max_length=7)
    schedule = models.ForeignKey(
        Schedule,
        on_delete=CASCADE,
        related_name='timeblocks'
    )
