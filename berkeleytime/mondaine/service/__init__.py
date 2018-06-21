"""Abstract Playlist Service."""
from mondaine.service.store.playlist import playlist_store


class AbstractPlaylistService:
    """Abstract Playlist Category Service."""

    def _update(self, playlist, definition, courses):
        """Take a single playlist and definition and update it."""
        course_ids = []
        for course in courses:
            if definition.satisfies(course):
                course_ids.append(course.id)
        playlist_store.replace_course_ids(playlist.id, course_ids)

    def _replace_course_ids(self, playlist, course_ids):
        """Take a single playlist and replace its course_ids."""
        playlist_store.replace_course_ids(playlist.id, course_ids)
