"""Level playlist service."""
from catalog.service.course import course_service

from mondaine.service import AbstractPlaylistService
from mondaine.service.definition.constraint import ConstraintDefinition
from mondaine.lib import formulas, utils
from mondaine.service.entity.playlist import Playlist
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.store.playlist import playlist_store


class DepartmentService(AbstractPlaylistService):
    """Department Service."""

    def update(self):
        """Update playlist for specific course number ranges."""
        courses = course_service.find()

        abbreviations = course_service.distinct_field('abbreviation')
        # Sort by department name
        abbreviations_departments = sorted([
            (a, utils.abbreviation_to_department(a)) for a in abbreviations
        ], key=lambda x: x[1])

        for abbreviation, department in abbreviations_departments:
            definition = ConstraintDefinition(
                constraints=[formulas.abbreviation_in([abbreviation])]
            )

            playlist = Playlist({
                'name': str(department),
                'category': str(PlaylistCategory.department)
            })

            playlist = playlist_store.get_or_create(playlist)

            self._update(
                playlist=playlist, definition=definition,
                courses=courses
            )

department_service = DepartmentService()
