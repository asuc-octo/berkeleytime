"""Resources for parsing the American Cultures requirement website."""
import universal_csv

class AmericanCulturesResource(object):
    """Resource for American Cultures requirement."""

    def get(self):
        """Return a Mapper Definition for the American Cultures Requirement"""
        return universal_csv.handler('data/american_cultures/processed/spring_2017/american_cultures.csv')

american_cultures_resource = AmericanCulturesResource()