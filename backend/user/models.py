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

def create_user(data):
    """ Automatically create a django user while creating
    a berkeleytimeuser model. """
    # create django user
    user_data = data['user']
    user = User.objects.create(
        email = user_data['email'],
        first_name = user_data['first_name'],
        last_name = user_data['last_name'],
        username = user_data['email'].replace('@berkeley.edu', '')
    )
    user.save()
    
    # create berkeleytimeuser
    btUser = BerkeleytimeUser.objects.create(
        user = user,
        # other fields are left at default upon registration
        # we could add the option to populate them later
    )
    btUser.save()

    return btUser
