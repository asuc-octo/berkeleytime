"""Haas playlist service."""
from catalog.service.course import course_service
from mondaine.service.entity.playlist import Playlist
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.enumeration.ls import LSPlaylistName

from mondaine.service import AbstractPlaylistService
from mondaine.service.definition.engineering import EngineeringDefinition
from mondaine.service.store.playlist import playlist_store
from mondaine.service.resource.ls import ls_resource
from mondaine.service.resource.foreign_language import foreign_language_resource  # noqa


class EngineeringService(AbstractPlaylistService):
    """Engineering Service."""

    playlist_name = 'Humanities and Social Sciences'

    required_ls_playlist_names = (
        LSPlaylistName.arts_and_literature,
        LSPlaylistName.historical_studies,
        LSPlaylistName.international_studies,
        LSPlaylistName.philosophy_and_values,
        LSPlaylistName.social_and_behavior_sciences,
    )

    def update(self):
        """Update corresponding playlist."""
        definitions = [foreign_language_resource.get()]
        courses = course_service.find()

        for ls_playlist_name in self.required_ls_playlist_names:
            definitions.append(ls_resource.get(ls_playlist_name))

        definition = EngineeringDefinition(definitions=definitions)

        playlist = Playlist({
            'name': str(self.playlist_name),
            'category': str(PlaylistCategory.engineering)
        })
        playlist = playlist_store.get_or_create(playlist)

        self._update(
            playlist=playlist, definition=definition,
            courses=courses
        )

engineering_service = EngineeringService()
