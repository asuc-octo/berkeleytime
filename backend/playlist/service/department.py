"""Department Playlist Service."""
from catalog.models import Course
from playlist.enums import PlaylistCategory
from playlist.models import Playlist
from playlist.service.abstract import AbstractPlaylistService
from playlist.utils.definition import ConstraintDefinition
from playlist.utils import formulas, utils


class DepartmentService(AbstractPlaylistService):
    """Department Service."""

    def update(self):
        """Update playlists broken down by department."""
        abbreviations = Course.objects.values_list('abbreviation', flat=True).distinct()
        abbreviations_departments = sorted(
            filter(
                lambda abbrev_dept: abbrev_dept[1] is not None,
                [(a, utils.abbreviation_to_department(a)) for a in abbreviations]
            ),
            key=lambda x: x[1]
        )

        for abbreviation, department in abbreviations_departments:
            definition = ConstraintDefinition(
                constraints=[formulas.abbreviation_in([abbreviation])]
            )

            playlist, created = Playlist.objects.get_or_create(
                name=str(department),
                category=str(PlaylistCategory.department)
            )

            self._update(playlist, definition)


department_service = DepartmentService()
