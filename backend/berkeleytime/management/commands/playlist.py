"""Playlist management command."""
from django.core.management.base import BaseCommand

from playlist.enums import PlaylistCategory
from playlist.service import playlist_service


playlists = {
    'ls': PlaylistCategory.ls,
    'reading': PlaylistCategory.reading,
    'haas': PlaylistCategory.haas,
    'university': PlaylistCategory.university,
    'engineering': PlaylistCategory.engineering,
    'units': PlaylistCategory.units,
    'level': PlaylistCategory.level,
    'department': PlaylistCategory.department,
    'semester': PlaylistCategory.semester,
}


class Command(BaseCommand):
    """python manage.py playlist [category] [--refresh] [--clean]"""

    def add_arguments(self, parser):
        parser.add_argument(
            '--category',
            action='store',
            help="Select a category of playlists to update.",
        )
        parser.add_argument(
            '--refresh',
            action='store_true',
            help="Force fetch the current semester data from SIS.",
        )
        parser.add_argument(
            '--clean',
            action='store_true',
            help="Clean up potential playlist orphans by deleting all playlists before recreating them.",
        )


    def handle(self, *args, **options):
        """Command handler."""
        print('Running python3 manage.py playlist')
        category = options['category'] and playlists[options['category']]
        if options['clean']:
            playlist_service.clean(category)
        if options['refresh']:
            playlist_service.refresh_current_semester(category)
        playlist_service.update(category)
