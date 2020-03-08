"""Resource definitions for L&S breadth pages."""
import universal_csv
import os

from berkeleytime.settings import CURRENT_SEMESTER
from berkeleytime.settings import CURRENT_YEAR
from berkeleytime.settings import PAST_SEMESTERS

from mondaine.service.enumeration.ls import LSPlaylistName

PROCESSED_CSVS = os.path.join(os.path.dirname(__file__), 'data/ls/processed')  # noqa

class LSResource(object):
    """
    Resource for a Letters and Sciences breadth requirement page.
    Includes data for current and past semesters.
    """

    csvs = {
        LSPlaylistName.arts_and_literature: 'arts_literature',  # noqa
        LSPlaylistName.biological_science: 'biological_science',  # noqa
        LSPlaylistName.historical_studies: 'historical_studies',  # noqa
        LSPlaylistName.international_studies: 'international_studies',  # noqa
        LSPlaylistName.philosophy_and_values: 'philosophy_values',  # noqa
        LSPlaylistName.physical_science: 'physical_science',  # noqa
        LSPlaylistName.social_and_behavior_sciences: 'social_behavioral_sciences',  # noqa
    }

    def get(self, playlist_name):
        """
        Take a playlist name and returns a list of (semester, year, definition) tuples.
        """
        semester_data = (
            PAST_SEMESTERS + [{'semester': CURRENT_SEMESTER, 'year': CURRENT_YEAR}]  # noqa
        )
        breadth_defs = list()
        for data in semester_data:
            semester, year = data['semester'], data['year']
            filename = '%s/%s/%s.csv' % ('data/ls/processed', semester + '_' + year, self.csvs.get(playlist_name))
            definition = universal_csv.handler(filename)
            if definition:
                breadth_defs.append((semester.capitalize(), year, definition))
            else:
                print("filename does not exist:", filename)
        return breadth_defs

ls_resource = LSResource()
