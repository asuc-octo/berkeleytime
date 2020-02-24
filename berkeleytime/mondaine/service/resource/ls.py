"""Resource definitions for L&S breadth pages."""
import universal_csv
import os

from mondaine.service.enumeration.ls import LSPlaylistName

PROCESSED_CSVS = os.path.join(os.path.dirname(__file__), 'data/ls/processed')  # noqa

class LSResource(object):
    """Resource for a Letters and Sciences breadth requirement page."""

    csvs = {
        LSPlaylistName.arts_and_literature: 'arts_literature',  # noqa
        LSPlaylistName.biological_science: 'biological_science',  # noqa
        LSPlaylistName.historical_studies: 'historical_studies',  # noqa
        LSPlaylistName.international_studies: 'international_studies',  # noqa
        LSPlaylistName.philosophy_and_values: 'philosophy_values',  # noqa
        LSPlaylistName.physical_science: 'physical_science',  # noqa
        LSPlaylistName.social_and_behavior_sciences: 'social_behavioral_sciences',  # noqa
    }

    semesters = ["spring_2020"]

    def get(self, playlist_name):
        """Take a playlist name and return a single breadth definition."""
        breadth_def = None
        for semester in self.semesters:
            filename = '%s/%s/%s.csv' % ('data/ls/processed', semester, self.csvs.get(playlist_name))
            breadth_def = universal_csv.handler(filename)
        #TODO: Merge breadth_defs for different semesters
        return breadth_def

ls_resource = LSResource()
