"""Reading playlist service."""
from catalog.service.course import course_service
from mondaine.service.entity.playlist import Playlist
from mondaine.service.enumeration.reading import ReadingPlaylistName
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.store.playlist import playlist_store
from mondaine.service.resource.reading import reading_resource


class ReadingService(object):
    """Reading Service."""

    def update(self):
        """Update corresponding playlists."""
        courses = course_service.find()
        definition_a, definition_b = reading_resource.get()

        # Reading and Composition A
        playlist_a = Playlist({
            'name': str(ReadingPlaylistName.reading_and_composition_a),
            'category': str(PlaylistCategory.university),
        })
        playlist_a = playlist_store.get_or_create(playlist_a)
        self._update(playlist_a, definition_a, courses)

        # Reading and Composition B
        playlist_b = Playlist({
            'name': str(ReadingPlaylistName.reading_and_composition_b),
            'category': str(PlaylistCategory.university),
        })
        playlist_b = playlist_store.get_or_create(playlist_b)
        self._update(playlist_b, definition_b, courses)

    def _update(self, playlist, definition, courses):
        """Take a single playlist and definition and update it."""
        course_ids = []
        for course in courses:
            if definition.satisfies(course):
                course_ids.append(course.id)
        playlist_store.replace_course_ids(playlist.id, course_ids)

reading_service = ReadingService()
