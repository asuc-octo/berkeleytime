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

    refreshable_services = [PlaylistCategory.ls]
    cleanable_services = [PlaylistCategory.ls]

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

    def refresh_current_semester(self, category=None):
        """Fetch and cache the playlist courses from SIS for the current semester."""
        if category:
            self._refresh_current_semester(category)
            return

        for category in self.refreshable_services:
            self._refresh_current_semester(category)

    def _refresh_current_semester(self, category):
        service = self.services[category]
        service.refresh_current_semester()

    def clean(self, category=None):
        """Clean up potential playlist orphans by deleting all playlists before recreating them."""
        if category:
            self._clean(category)
            return

        for category in self.cleanable_services:
            self._clean(category)

    def _clean(self, category):
        service = self.services[category]
        service.delete_all()

    def find(self, category):
        """Find all playlists matching a enum.PlaylistCategory."""
        service = self.services[category]
        service.find()


playlist_service = PlaylistService()
