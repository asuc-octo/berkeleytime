from catalog.models import Course, Playlist
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django_facebook.models import FacebookProfileModel

class BerkeleytimeUserProfile(FacebookProfileModel):
    user = models.OneToOneField(User)
    is_legacy = models.BooleanField(default=False)

def create_facebook_profile(sender, instance, created, **kwargs):
    """
    Make sure a BerkeleytimeUserProfile is created when creating a
    user via Facebook
    """
    if created:
        user = BerkeleytimeUserProfile.objects.create(user=instance)

post_save.connect(create_facebook_profile, sender=User)

def user_post_delete(sender, instance, **kwargs):
    try:
        Playlist.objects.filter(user=instance.get_profile()).delete()
        BerkeleytimeUserProfile.objects.get(user=instance).delete()
    except:
        pass

def user_post_save(sender, instance, **kwargs):
    try:
        profile, new = BerkeleytimeUserProfile.objects.get_or_create(user=instance)
        Playlist.objects.get_or_create(user=profile, name="Favorites", category="custom")
    except:
        pass

models.signals.post_delete.connect(user_post_delete, sender=User)
models.signals.post_save.connect(user_post_save, sender=User)
