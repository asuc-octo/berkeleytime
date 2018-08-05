"""Playlist management command."""

# This import is a hack since with Django 1.6 there's an odd circular import
# error ('cannot import name actions') when django tries to import these modules
# like four levels down. This error only happens when running management
# commands. When we upgrade to Django 1.7+, we might be able to remove this.
# See https://stackoverflow.com/questions/24186814/importerror-cannot-import-name-actions
from django.contrib.admin import ModelAdmin, actions # noqa

from django.core.management.base import BaseCommand
from mondaine.service.playlist import playlist_service
from mondaine.service.enumeration.category import PlaylistCategory


playlists = {
    "ls": PlaylistCategory.ls,
    "reading": PlaylistCategory.reading,
    "haas": PlaylistCategory.haas,
    "university": PlaylistCategory.university,
    "engineering": PlaylistCategory.engineering,
    "units": PlaylistCategory.units,
    "level": PlaylistCategory.level,
    "department": PlaylistCategory.department,
    "semester": PlaylistCategory.semester,
}

class Command(BaseCommand):
    """python manage.py playlist."""

    def handle(self, *args, **options):
        """Command handler."""
        if len(args) == 0:
            playlist_service.update()

        else:
            playlist_service.update(playlists[args[0]])