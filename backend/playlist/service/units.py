"""Unit Playlist Service."""
from playlist.enums import PlaylistCategory
from playlist.models import Playlist
from playlist.service.abstract import AbstractPlaylistService
from playlist.utils import formulas
from playlist.utils.definition import ConstraintDefinition


class UnitService(AbstractPlaylistService):
    """Unit Service."""

    def update(self):
        """Update playists for classes with X units."""

        for units in [0.5, 1, 2, 3, 4, 5]:
            playlist_name = '%s Unit' % units if units == 1 else '%s Units' % units

            definition = ConstraintDefinition(
                constraints=[formulas.exactly_n_units(n=units)]
            )

            playlist, created = Playlist.objects.get_or_create(
                name=str(playlist_name),
                category=str(PlaylistCategory.units),
            )

            self._update(playlist, definition)

units_service = UnitService()
