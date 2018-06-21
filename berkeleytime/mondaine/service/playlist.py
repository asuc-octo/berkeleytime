"""Playlist Service."""
from mondaine.service.department import department_service
from mondaine.service.engineering import engineering_service
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.haas import haas_service
from mondaine.service.level import level_service
from mondaine.service.ls import ls_service
from mondaine.service.reading import reading_service
from mondaine.service.semester import semester_service
from mondaine.service.units import units_service
from mondaine.service.university import university_service


class PlaylistService(object):
    """Playlist Service."""

    services = {
        PlaylistCategory.ls: ls_service,
        PlaylistCategory.reading: reading_service,
        PlaylistCategory.haas: haas_service,
        PlaylistCategory.university: university_service,
        PlaylistCategory.engineering: engineering_service,
        PlaylistCategory.units: units_service,
        PlaylistCategory.level: level_service,
        PlaylistCategory.department: department_service,
        PlaylistCategory.semester: semester_service,
    }

    def update(self, category=None):
        """Update all playlist categories."""
        if category:
            self._update(category)
            return

        for category in self.services.keys():
            self._update(category)

    def _update(self, category):
        """Take an enum.PlaylistCategory and update its playlists."""
        service = self.services[category]
        service.update()

    def find(self, category):
        """Find all playlists matching a enum.PlaylistCategory."""
        service = self.services[category]
        service.find()

playlist_service = PlaylistService()
