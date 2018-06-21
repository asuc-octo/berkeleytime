"""Playlist management command."""
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