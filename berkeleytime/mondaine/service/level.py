"""Level playlist service."""
from catalog.service.course import course_service

from mondaine.service import AbstractPlaylistService
from mondaine.service.definition.constraint import ConstraintDefinition
from mondaine.lib import formulas
from mondaine.service.entity.playlist import Playlist
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.enumeration.level import LevelPlaylistName
from mondaine.service.store.playlist import playlist_store


class LevelService(AbstractPlaylistService):
    """Level Service."""

    course_number_ranges = {
        LevelPlaylistName.lower_division: xrange(1, 100),
        LevelPlaylistName.upper_division: xrange(100, 200),
        LevelPlaylistName.graduate: xrange(200, 300),
        LevelPlaylistName.professional: xrange(300, 500),
        LevelPlaylistName.freshmen_sophomore_seminars: (24, 39, 84,),
        LevelPlaylistName.directed_group_study: (98, 198,),
        LevelPlaylistName.supervised_independent_study: (99, 199,),
        LevelPlaylistName.field_study: (197,),
    }

    def update(self):
        """Update playlist for specific course number ranges."""
        courses = course_service.find()

        for playlist_name in LevelPlaylistName:
            course_number_range = self.course_number_ranges[playlist_name]
            definition = ConstraintDefinition(
                constraints=[formulas.course_integer_in(course_number_range)]
            )

            playlist = Playlist({
                'name': str(playlist_name),
                'category': str(PlaylistCategory.level)
            })

            playlist = playlist_store.get_or_create(playlist)

            self._update(
                playlist=playlist, definition=definition,
                courses=courses
            )

    def is_normal_undergraduate(self, course):
        """Given a course number, return whether it's a normal undergrad.

        This will include only lower and upper division undergrad courses, and
        will exclude things like seminars.
        """
        in_constraints = [
            formulas.course_integer_in(
                self.course_number_ranges[LevelPlaylistName.lower_division]
            ),
            formulas.course_integer_in(
                self.course_number_ranges[LevelPlaylistName.upper_division]
            )
        ]
        out_constraints = [
            formulas.course_integer_not_in(
                self.course_number_ranges[LevelPlaylistName.freshmen_sophomore_seminars] # noqa
            ),
            formulas.course_integer_not_in(
                self.course_number_ranges[LevelPlaylistName.directed_group_study] # noqa
            ),
            formulas.course_integer_not_in(
                self.course_number_ranges[LevelPlaylistName.supervised_independent_study] # noqa
            ),
            formulas.course_integer_not_in(
                self.course_number_ranges[LevelPlaylistName.field_study]
            ),
        ]
        result = any(
            [f(course) for f in in_constraints]
        ) and all(
            [f(course) for f in out_constraints]
        )
        # print "---- Filter: {}: {}".format(course.course_number, result)
        return result

level_service = LevelService()
