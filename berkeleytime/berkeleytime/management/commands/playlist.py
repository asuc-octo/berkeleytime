from optparse import make_option

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
    """python manage.py playlist [category] [--force_fetch]"""

    option_list = BaseCommand.option_list + (
        make_option(
            '--refresh',
            action='store_true',
            dest='refresh',
            default=False,
            help='Force fetch the current semester data from SIS'),
        make_option(
            '--clean',
            action='store_true',
            dest='clean',
            default=False,
            help='Clean up potential playlist orphans by deleting all playlists before recreating them.'),
        )

    def handle(self, *args, **options):
        """Command handler."""
        if len(args) == 0:
            if options['clean']:
                playlist_service.clean()
            if options['refresh']:
                playlist_service.refresh_current_semester()
            playlist_service.update()
        else:
            category = playlists[args[0]]
            if options['clean']:
                playlist_service.clean(category)
            if options['refresh']:
                playlist_service.refresh_current_semester(category)
            playlist_service.update(category)
