from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class BerkeleytimeUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='berkeleytimeuser')
    major = models.CharField(max_length=100)
    # potentially many to many with a major model
    # saved_classes = many to many to Course
    # saved_schedules = one to many to Schedule
    # and a bunch of BooleanFields for email preferences
