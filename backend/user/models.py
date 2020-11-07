from django.db import models
from django.contrib.auth.models import User
from catalog.models import Course

# Create your models here.

class BerkeleytimeUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='berkeleytimeuser')
    major = models.CharField(max_length=100)
    # potentially many to many with a major model
    saved_classes = models.ManyToManyField(Course)
    # saved_schedules = one to many to Schedule

    # email preferences
    email_class_update = models.BooleanField(default=False)
    email_grade_update = models.BooleanField(default=False)
    email_enrollment_opening = models.BooleanField(default=False)
    email_berkeleytime_update = models.BooleanField(default=False)
