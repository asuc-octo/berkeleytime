"""Semester playlist service."""
from berkeleytime.settings import CURRENT_SEMESTER
from berkeleytime.settings import CURRENT_YEAR
from berkeleytime.settings import PAST_SEMESTERS

from catalog.service.course import course_service
from catalog.service.section import section_service
from mondaine.service import AbstractPlaylistService

from mondaine.service.entity.playlist import Playlist
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.store.playlist import playlist_store


class SemesterService(AbstractPlaylistService):
    """Semester Service."""

    def update(self):
        """Update playlist for each semester."""
        # Gaping abstraction leak, but this gets all the semesters
        semester_data = (
            PAST_SEMESTERS + [{'semester': CURRENT_SEMESTER, 'year': CURRENT_YEAR}]  # noqa
        )

        for data in semester_data:
            semester, year = data['semester'], data['year']
            if not section_service.exists(semester=semester, year=year):
                continue

            course_ids = course_service.find_ids_by_semester(
                semester=semester, year=year
            )

            playlist = Playlist({
                'name': ('%s %s' % (semester, year)).title(),
                'category': str(PlaylistCategory.semester)
            })
            playlist = playlist_store.get_or_create(playlist)

            self._replace_course_ids(
                playlist=playlist, course_ids=course_ids,
            )

semester_service = SemesterService()
