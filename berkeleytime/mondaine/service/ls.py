"""Letters and Science playlist service."""
from catalog.service.course import course_service
from mondaine.service.entity.playlist import Playlist
from mondaine.service.enumeration.ls import LSPlaylistName
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.store.playlist import playlist_store
from mondaine.service.resource.ls import ls_resource


class LSService(object):
    """LS Service."""

    @staticmethod
    def delete_all():
        """Delete all playlists in the LS category."""
        print "Deleting all playlists in L&S..."
        playlist_store.delete_playlists_in_category(str(PlaylistCategory.ls))

    def update(self):
        """Update corresponding playlists."""
        for playlist_name in LSPlaylistName:
            print str(playlist_name), str(PlaylistCategory.ls)
            definitions = self.define(playlist_name)
            for semester, year, definition in definitions:
                playlist = Playlist({
                    'name': str(playlist_name),
                    'category': str(PlaylistCategory.ls),
                    'semester': str(semester),
                    'year': str(year)
                })
                playlist = playlist_store.get_or_create(playlist)
                self._update(
                    playlist=playlist, definition=definition,
                    courses=course_service.find()
                )

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
        playlist_store.replace_course_ids(playlist.id, course_ids)
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
            print "Failed to index courses into playlist (cross-listed courses are probably fine): "
            for course in missing_from_actual:
                print course[0] + " " + course[1]
        if missing_from_expected:
            print "Indexed extra courses into playlist: "
            for course in missing_from_expected:
                print course[0] + " " + course[1]

    @staticmethod
    def define(playlist_name):
        """Take a enum.PlaylistName and return the corresponding definitions."""
        return ls_resource.get(playlist_name=str(playlist_name))


ls_service = LSService()
