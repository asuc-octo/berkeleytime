"""Playlist Service."""
from playlist.service import (
    department_service,
    engineering_service,
    haas_service,
    level_service,
    ls_service,
    reading_service,
    semester_service,
    units_service,
    university_service,
)
from playlist.enums import PlaylistCategory


class PlaylistService:
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
        """Update all playlist categories.

        If given category, update only playlists in that category.
        """
        if category:
            self.services[category].update()
        else:
            for category in self.services:
                self.services[category].update()

    def refresh_current_semester(self, category=None):
        """Fetch the playlist courses from SIS for the current semester, overwriting the cache."""
        if category:
            self.services[category].refresh_current_semester()
        else:
            for category in self.refreshable_services:
                self.services[category].refresh_current_semester()

    def clean(self, category=None):
        """Clean up potential playlist orphans by deleting all playlists before recreating them."""
        if category:
            Playlist.objects.filter(category=category).delete()
        else:
            for category in self.cleanable_services:
                Playlist.objects.filter(category=category).delete()


playlist_service = PlaylistService()
