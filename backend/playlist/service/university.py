"""University Playlist Service."""
from playlist.enums import PlaylistCategory, UniversityPlaylistName
from playlist.models import Playlist
from playlist.resource import american_cultures_resource
from playlist.service.abstract import AbstractPlaylistService
from playlist.utils import formulas
from playlist.utils.definition import ConstraintDefinition, MapperDefinition


class UniversityService(AbstractPlaylistService):
    """University Service."""

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
                'excluded': set(['24', '39', '98', '99', '195', '198', '199'])
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
        UniversityPlaylistName.american_history: american_history_definition,
        UniversityPlaylistName.american_institutions: american_institutions_definition,
        UniversityPlaylistName.quantitative_reasoning: quantitative_reasoning_definition,
        UniversityPlaylistName.college_writing: college_writing_definition,
    }

    def update(self):
        """Update corresponding playlists."""
        for playlist_name in UniversityPlaylistName:
            if playlist_name == UniversityPlaylistName.american_cultures:
                definition = american_cultures_resource.get()
            else:
                definition = self.definitions[playlist_name]

            playlist, created = Playlist.objects.get_or_create(
                name=str(playlist_name),
                category=str(PlaylistCategory.university),
            )

            self._update(playlist, definition)


university_service = UniversityService()
