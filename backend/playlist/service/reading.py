"""Reading Playlist Service."""
from playlist.enums import PlaylistCategory, ReadingPlaylistName
from playlist.models import Playlist
from playlist.resource import reading_resource
from playlist.service.abstract import AbstractPlaylistService


class ReadingService(AbstractPlaylistService):
    """Reading Service."""

    def update(self):
        """Update corresponding playlists."""
        definition_a, definition_b = reading_resource.get()

        # Reading and Composition A
        playlist_a, created = Playlist.objects.get_or_create(
            name=str(ReadingPlaylistName.reading_and_composition_a),
            category=str(PlaylistCategory.university),
        )
        self._update(playlist_a, definition_a)

        # Reading and Composition B
        playlist_b, created = Playlist.objects.get_or_create(
            name=str(ReadingPlaylistName.reading_and_composition_b),
            category=str(PlaylistCategory.university),
        )
        self._update(playlist_b, definition_b)


reading_service = ReadingService()
