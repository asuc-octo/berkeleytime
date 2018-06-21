"""Haas playlist service."""
from catalog.service.course import course_service
from mondaine.service.entity.playlist import Playlist
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.enumeration.ls import LSPlaylistName
from mondaine.service.enumeration.haas import HaasPlaylistName

from mondaine.service import AbstractPlaylistService
from mondaine.service.definition.haas import HaasBreadthDefinition
from mondaine.service.store.playlist import playlist_store
from mondaine.service.resource.ls import ls_resource
from mondaine.service.resource.reading import reading_resource


class HaasService(AbstractPlaylistService):
    """Haas Service."""

    def update(self):
        """Update corresponding playlists."""
        reading_definitions = reading_resource.get()
        courses = course_service.find()

        for playlist_name in HaasPlaylistName:
            # Enum34 trickery to get the LSPlaylistName with the same key
            key = playlist_name.name
            ls_playlist_name = getattr(LSPlaylistName, key)
            ls_definition = ls_resource.get(playlist_name=ls_playlist_name)

            # Construct Haas definition from combination of LS/Reading
            # definitions #defin-ception
            definition = HaasBreadthDefinition(
                ls_definition=ls_definition,
                excluded_definitions=reading_definitions
            )

            playlist = Playlist({
                'name': str(playlist_name),
                'category': str(PlaylistCategory.haas)
            })
            playlist = playlist_store.get_or_create(playlist)

            self._update(
                playlist=playlist, definition=definition,
                courses=courses
            )

    def define(self, playlist_name):
        """Take a enum.PlaylistName and return the corresponding definition."""
        return ls_resource.get(playlist_name=playlist_name)

haas_service = HaasService()
