"""University playlist service."""
# from mondaine.define.utils import define_course_list
# from mondaine import config
from catalog.service.course import course_service
from mondaine.service.definition.constraint import ConstraintDefinition
from mondaine.lib import formulas
from mondaine.service.entity.playlist import Playlist
from mondaine.service import AbstractPlaylistService
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.definition.mapper import MapperDefinition
from mondaine.service.enumeration.university import UniversityPlaylistName
from mondaine.service.resource.american_cultures import american_cultures_resource  # noqa
from mondaine.service.store.playlist import playlist_store


class UniversityService(AbstractPlaylistService):
    """University service."""

    american_history_definition = ConstraintDefinition(
        constraints=[formulas.course_in(
            [
                'HISTORY 7A', 'HISTORY 7B', 'HISTORY 130B',
                'HISTORY 131A', 'HISTORY 131B', 'HISTORY N131B',
                'HISTORY 138'
            ]
        )]
    )
    american_institutions_definition = ConstraintDefinition(
        constraints=[formulas.course_in(
            ['POL SCI 1', 'POL SCI 1AC', 'POL SCI 108A']
        )]
    )

    quantitative_reasoning_definition = MapperDefinition(
        constraints=[
            formulas.gte_n_units(n=3),
            formulas.abbreviation_in(['MATH', 'STAT', 'COMPSCI'])
        ],
        mapper={
            'COMPSCI': {
                'excluded': set([
                    '15', '24', '39', '49', '84', '96',
                    '98', '103', '160', '199'])
            },
            'MATH': {
                'excluded': set(['24', '39', '98', '198', '199'])
            },
            'STAT': {
                'excluded': set(['24', '39', '98', '99', '195', '198', '199'])  # noqa
            }
        }
    )

    """
    Note: the definition of college writing is pretty vague and is
    different based on where you look. From
    http://admission.universityofcalifornia.edu/counselors/graduation-requirements/writing/
    it says 'Complete an appropriate English course at UC with a grade of C
    or better.' This is just a hardcoded list of college writing courses for
    now.
    """
    college_writing_definition = MapperDefinition(
        mapper={
            'COLWRIT': {
                'allowed': set([
                    '1', 'R1A', 'R1A FFP', 'R4A', 'R4B', '10A',
                    '10B', '25AC', '50AC', '99', '105', '108',
                    '110', '121', '130', '150AC', '151', '152',
                    '180', 'W180', '199', '300', '300P', '301',
                    'N2'])
            }
        }
    )

    definitions = {
        UniversityPlaylistName.american_history: american_history_definition,  # noqa
        UniversityPlaylistName.american_institutions: american_institutions_definition,  # noqa
        UniversityPlaylistName.quantitative_reasoning: quantitative_reasoning_definition,  # noqa
        UniversityPlaylistName.college_writing: college_writing_definition,  # noqa
    }

    def update(self):
        """Update corresponding playlists."""
        courses = course_service.find()
        for playlist_name in UniversityPlaylistName:
            if playlist_name == UniversityPlaylistName.american_cultures:
                definition = american_cultures_resource.get()
            else:
                definition = self.definitions[playlist_name]

            playlist = Playlist({
                'name': str(playlist_name),
                'category': str(PlaylistCategory.university)
            })
            playlist = playlist_store.get_or_create(playlist)

            self._update(
                playlist=playlist, definition=definition,
                courses=courses
            )

university_service = UniversityService()
