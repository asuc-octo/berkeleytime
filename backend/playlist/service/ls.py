"""Letters and Science Playlist Service."""
from catalog.service import course_service
from playlist.enums import PlaylistCategory, LSPlaylistName
from playlist.models import Playlist
from playlist.resource import ls_resource
from playlist.service import AbstractPlaylistService


class LSService(AbstractPlaylistService):
    """LS Service."""

    def update(self):
        """Update corresponding playlists."""
        for playlist_name in LSPlaylistName:
            definitions = LSService.define(playlist_name)
            for semester, year, definition in definitions:
                playlist, created = Playlist.objects.get_or_create(
                    name=str(playlist_name),
                    category=str(PlaylistCategory.ls),
                    semester=str(semester),
                    year=str(year),
                )
                self._update(playlist, definition)

    @staticmethod
    def refresh_current_semester():
        """Refresh the most recent LS breadth courses from SIS."""
        ls_resource.refresh_current_semester()

    def _update(self, playlist, definition, courses):
        """Take a single playlist and definition and update it."""
        course_ids = []
        added_courses = set()
        for course in courses:
            if definition.satisfies(course):
                course_ids.append(course.id)
                added_courses.add((course.abbreviation, course.course_number))
        self.replace_course_ids(playlist, course_ids)
        self._check_courses_match(expected_courses=definition.get_all_allowed_courses_set(),
                                  actual_courses=added_courses)

    @staticmethod
    def _check_courses_match(expected_courses, actual_courses):
        """Check for abbreviation mismatch."""
        unsupported = set()
        for course in expected_courses:
            if course[0][:3] == 'EAP':
                unsupported.add(course)  # EAP courses are not supported by BerkeleyTime
        expected_courses -= unsupported
        missing_from_actual = expected_courses - actual_courses - unsupported  # abbreviation mismatch
        missing_from_expected = actual_courses - expected_courses  # this should never happen
        if missing_from_actual:
            print("Failed to index courses into playlist (cross-listed courses are probably fine): ")
            for course in missing_from_actual:
                print(course[0] + " " + course[1])
        if missing_from_expected:
            print("Indexed extra courses into playlist: ")
            for course in missing_from_expected:
                print(course[0] + " " + course[1])

    @staticmethod
    def define(playlist_name):
        """Take a enum.PlaylistName and return the corresponding definitions."""
        return ls_resource.get(playlist_name=str(playlist_name))


ls_service = LSService()
