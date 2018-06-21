"""Unit playlist service."""
from catalog.service.course import course_service

from mondaine.service import AbstractPlaylistService
from mondaine.service.definition.constraint import ConstraintDefinition
from mondaine.lib import formulas
from mondaine.service.entity.playlist import Playlist
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.store.playlist import playlist_store


class UnitService(AbstractPlaylistService):
    """Unit Service."""

    def update(self):
        """Update playists for classes with X units."""
        courses = course_service.find()

        for units in [0.5, 1, 2, 3, 4, 5]:
            playlist_name = '%s Unit' % units if units == 1 else '%s Units' % units  # noqa

            definition = ConstraintDefinition(
                constraints=[formulas.exactly_n_units(n=units)]
            )
            playlist = Playlist({
                'name': str(playlist_name),
                'category': str(PlaylistCategory.units)
            })
            playlist = playlist_store.get_or_create(playlist)

            self._update(
                playlist=playlist, definition=definition,
                courses=courses
            )

units_service = UnitService()
