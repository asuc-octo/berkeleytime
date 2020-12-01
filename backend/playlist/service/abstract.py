"""Abstract Playlist Service."""
import sys

from catalog.models import Course

class AbstractPlaylistService:
    """Abstract Playlist Category Service."""

    def _update(self, playlist, definition):
        """Take a single playlist and definition and update it."""
        course_ids = []
        for course in Course.objects.all():
            if definition.satisfies(course):
                course_ids.append(course.id)
        self.replace_course_ids(playlist, course_ids)


    def replace_course_ids(self, playlist, course_ids):
        """Replace a playlist's existing courses."""
        playlist.courses.set(course_ids)
        playlist.save()
        print({
            'message': 'Playlist updated',
            'name': playlist.name,
            'semester': playlist.semester,
            'year': playlist.year,
            'id': playlist.id,
            'courses': len(course_ids),
        })
