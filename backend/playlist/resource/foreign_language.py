"""Foreign Language resource."""

import urllib2
from bs4 import BeautifulSoup

from playlist.lib import utils
from playlist.service.definition.mapper import MapperDefinition

class ForeignLanguageResource:
    """Resource for foreign language classes that fulfill HSS requirements."""

    url = 'http://guide.berkeley.edu/undergraduate/colleges-schools/engineering/approved-foreign-language-courses/'

    def get(self):
        """Return a foreign language definition."""
        return self.handler(url=self.url)

    def handler(self, url):
        html = urllib2.urlopen(url).read()
        bs = BeautifulSoup(html)
        tables = bs.find_all('table')
        return self.map_def_classes(tables[0])

    def get_table_classes(self, table):
        """Return a list of classes from a table."""
        return [
            utils.clean(row.find('a').get('title'))
            for row in table.find('tbody').findAll('tr') if row.find('a')
        ]

    def map_def_classes(self, table):
        """Given a table of classes, returns a MapperDefinition with the classes added."""
        definition = MapperDefinition()
        for rc in self.get_table_classes(table):
            splitted = rc.split()
            abbreviation = " ".join(splitted[:-1])
            course_number = splitted[-1]
            definition.add(abbreviation, allowed=[course_number])
        return definition

foreign_language_resource = ForeignLanguageResource()
