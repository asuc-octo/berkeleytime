"""Engineering (H/SS and Foreign Language) Playlist Service."""
from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR
from playlist.enums import PlaylistCategory, LSPlaylistName
from playlist.models import Playlist
from playlist.resource import ls_resource, foreign_language_resource
from playlist.service import AbstractPlaylistService
from playlist.service.definition.engineering import EngineeringDefinition


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
        """Update playlists fulfilling engineering breadth requirements."""
        definitions = [foreign_language_resource.get()]

        for ls_playlist_name in self.required_ls_playlist_names:
            for semester, year, ls_definition in ls_resource.get(ls_playlist_name):
                if semester == CURRENT_SEMESTER and year == CURRENT_YEAR:
                    definitions.append(ls_definition)

        definition = EngineeringDefinition(definitions=definitions)

        playlist, created = Playlist.objects.get_or_create(
            name=self.playlist_name,
            category=str(PlaylistCategory.engineering)
        )

        self._update(playlist, definition)


engineering_service = EngineeringService()
