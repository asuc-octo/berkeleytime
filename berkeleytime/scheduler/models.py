from django.db import models
from catalog.models import Section
from account.models import BerkeleytimeUserProfile

import csv

# Create your models here.

class Schedule(models.Model):
    """
    Model of schedule.
    """
    # bind a schedule to a user_email
    # max length of an email field is 254 characters
    # to be complaint with RFCs 3696 and 5321
    user_email = models.EmailField(null=True, blank=True)

    # each schedule can have multiple Sections and each Section can belong to multiple schedules
    sections = models.ManyToManyField(Section, related_name="section")

    # if sync runs and at least one section is no longer valid
    is_invalid = models.BooleanField(default=False)

    # every schedule has a unique id
    uid = models.IntegerField(default=-1)

    def __unicode__(self):
        if self.sections.count() > 0:
            schedule_string = ''
            schedule_string += str(self.user_email) + '\n'
            for section in self.sections.all():
                schedule_string += section.__unicode__() + '\t'
                schedule_string += section.days + '\t'
                schedule_string += str(section.start_time.hour) + ':' + str(section.start_time.minute) + '\t'
                schedule_string += str(section.end_time.hour) + ':' + str(section.end_time.minute) + '\n'
            return unicode(schedule_string)
        return u'Empty schedule'


    # Subject, Start Date, End Date, Start Time, End Time, Location
    def export_csv(self):

        with open('schedule.csv', 'wb') as schedule_csv:
            writer = csv.writer(schedule_csv)
            writer.writerow(["Subject", "Start Date", "End Date", "Start Time", "End Time", "Location"])
            first_days = {"0": "01/21/2018", "1": "01/22/2018", "2": "01/16/2018", "3": "01/17/2018",
                          "4": "01/18/2018", "5": "01/19/2018", "6": "01/20/2018", "7": "01/21/2018"}
            end_day = "05/04/2018"
            for section in self.sections.all():
                days = [day for day in section.days]

                for day in days:
                    writer.writerow([section.abbreviation + ' ' + section.course_number,
                                     first_days[day],
                                     end_day,
                                     section.start_time,
                                     section.end_time,
                                     section.location_name])
