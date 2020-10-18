"""University Playlist Service."""
from playlist.enums import PlaylistCategory, UniversityPlaylistName
from playlist.models import Playlist
from playlist.resource import american_cultures_resource
from playlist.service.abstract import AbstractPlaylistService
from playlist.utils import formulas
from playlist.utils.definition import ConstraintDefinition, MapperDefinition


class UniversityService(AbstractPlaylistService):
    """University Service.

    Requirements are sourced from:
    http://guide.berkeley.edu/undergraduate/education/#earningyourdegreetext
    """

    american_history_definition = ConstraintDefinition(
        constraints=[formulas.course_in(
            set([
                'HISTORY 7A',
                'HISTORY 7B',
                'HISTORY 125A',
                'HISTORY 125B',
                'HISTORY 128AC',
                'HISTORY 130',
                'HISTORY 131B',
                'HISTORY 132C',
                'HISTORY 133A',
                'HISTORY 133B',
                'HISTORY 135B',
                'HISTORY 137AC',
                'HISTORY 138',
                'HISTORY 138T',
            ])
        )]
    )
    american_institutions_definition = ConstraintDefinition(
        constraints=[formulas.course_in(
            set([
                'POL SCI 1',
                'POL SCI N1AC',
                'HISTORY 137AC',
            ])
        )]
    )

    quantitative_reasoning_definition = MapperDefinition(
        constraints=[
            formulas.gte_n_units(n=3),
        ],
        mapper={
            'COMPSCI': {
                'allowed': set([
                    'C8',
                    '10',
                    'W10',
                    '61A',
                    '61B',
                    '61C',
                    '70',
                ])
            },
            'INFO': {
                'allowed': set(['C8'])
            },
            'MATH': {
                'allowed': set([
                    '1A',
                    '1B',
                    '10A',
                    '10B',
                    '16A',
                    '16B',
                    '32',
                    'N32',
                    '53',
                    'H53',
                    'W53',
                    '54',
                    'H54',
                    '55',
                    '74',
                ])
            },
            'STAT': {
                'allowed': set([
                    '2',
                    'C8',
                    '20',
                    '21',
                    'W21',
                ])
            }
        }
    )

    college_writing_definition = MapperDefinition(
        mapper={
            'COLWRIT': {
                'allowed': set(['R1A'])
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
