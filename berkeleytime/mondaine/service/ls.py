"""Letters and Science playlist service."""
from catalog.service.course import course_service
from mondaine.service.entity.playlist import Playlist
from mondaine.service.enumeration.ls import LSPlaylistName
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.store.playlist import playlist_store
from mondaine.service.resource.ls import ls_resource


class LSService(object):
    """LS Service."""

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

    def _update(self, playlist, definition, courses):
        """Take a single playlist and definition and update it."""
        course_ids = []
        for course in courses:
            if definition.satisfies(course):
                course_ids.append(course.id)
        playlist_store.replace_course_ids(playlist.id, course_ids)

    def define(self, playlist_name):
        """Take a enum.PlaylistName and return the corresponding definitions."""
        return ls_resource.get(playlist_name=playlist_name)

ls_service = LSService()
