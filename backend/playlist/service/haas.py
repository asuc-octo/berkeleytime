"""Haas Playlist Service."""
from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR
from playlist.enums import (
    PlaylistCategory,
    LSPlaylistName,
    HaasPlaylistName,
)
from playlist.models import Playlist
from playlist.resource import ls_resource, reading_resource
from playlist.service.abstract import AbstractPlaylistService
from playlist.utils.definition import HaasBreadthDefinition


class HaasService(AbstractPlaylistService):
    """Haas Service."""

    def update(self):
        """Update playlists fulfilling a Haas breadth requirement."""
        reading_definitions = reading_resource.get()

        for playlist_entry in HaasPlaylistName:
            ls_playlist_entry = LSPlaylistName[playlist_entry.name]
            ls_definition = None
            for semester, year, ls_def in ls_resource.get(playlist_name=ls_playlist_entry):
                if semester == CURRENT_SEMESTER and year == CURRENT_YEAR:
                    ls_definition = ls_def
                    break

            # Construct Haas definition from combination of LS/Reading definitions
            definition = HaasBreadthDefinition(
                ls_definition=ls_definition,
                excluded_definitions=reading_definitions
            )

            playlist, created = Playlist.objects.get_or_create(
                name=str(playlist_name),
                category=str(PlaylistCategory.haas)
            )

            self._update(playlist, definition)


haas_service = HaasService()
