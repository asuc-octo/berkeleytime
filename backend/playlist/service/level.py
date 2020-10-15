"""Level Playlist Service."""
from playlist.enums import PlaylistCategory, LevelPlaylistName
from playlist.models import Playlist
from playlist.lib import formulas
from playlist.service import AbstractPlaylistService
from playlist.service.definition.constraint import ConstraintDefinition


class LevelService(AbstractPlaylistService):
    """Level Service."""

    course_number_ranges = {
        LevelPlaylistName.lower_division: range(1, 100),
        LevelPlaylistName.upper_division: range(100, 200),
        LevelPlaylistName.graduate: range(200, 300),
        LevelPlaylistName.professional: range(300, 500),
        LevelPlaylistName.freshmen_sophomore_seminars: (24, 39, 84,),
        LevelPlaylistName.directed_group_study: (98, 198,),
        LevelPlaylistName.supervised_independent_study: (99, 199,),
        LevelPlaylistName.field_study: (197,),
    }

    def update(self):
        """Update playlist for specific course number ranges."""
        for playlist_name in LevelPlaylistName:
            course_number_range = self.course_number_ranges[playlist_name]
            definition = ConstraintDefinition(
                constraints=[formulas.course_integer_in(course_number_range)]
            )

            playlist, created = Playlist.objects.get_or_create(
                name=str(playlist_name),
                category=str(PlaylistCategory.level)
            )

            self._update(playlist, definition)


level_service = LevelService()
