"""Semester Playlist Service."""
from berkeleytime.settings import (
    CURRENT_SEMESTER,
    CURRENT_YEAR,
    PAST_SEMESTERS,
)
from catalog.models import Section
from playlist.enums import PlaylistCategory
from playlist.models import Playlist
from playlist.service.abstract import AbstractPlaylistService


class SemesterService(AbstractPlaylistService):
    """Semester Service."""

    def update(self):
        """Update playlist for each semester."""
        semester_data = (
            PAST_SEMESTERS + [{'semester': CURRENT_SEMESTER, 'year': CURRENT_YEAR}]
        )

        for data in semester_data:
            semester, year = data['semester'], data['year']
            if not Section.objects.filter(semester=semester, year=year).exists():
                continue

            course_ids = (
                Section.objects.filter(
                    semester=semester,
                    year=year,
                    disabled=False,
                )
                .values_list('course_id', flat=True)
                .distinct()
            )

            playlist, created = Playlist.objects.get_or_create(
                name=f'{semester} {year}'.title(),
                category=str(PlaylistCategory.semester),
            )

            self.replace_course_ids(playlist, course_ids)

semester_service = SemesterService()
