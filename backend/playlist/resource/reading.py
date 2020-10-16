"""playlist resources for reading/composition."""
from urllib.request import urlopen

from bs4 import BeautifulSoup

from playlist.utils import utils
from playlist.utils.definition import MapperDefinition


class ReadingResource(object):
    """Resource for R1A/R1B requirements."""

    url = 'http://guide.berkeley.edu/undergraduate/colleges-schools/letters-science/reading-composition-requirement/'

    def get(self):
        """Return a tuple of definitions."""
        return self.handler(url=self.url)

    def handler(self, url):
        """Return [R1A definition, R1B definition]."""
        html = urllib2.urlopen(url).read()
        bs = BeautifulSoup(html)
        tables = bs.find_all('table')

        r1a_table = tables[0]
        r1b_table = tables[1]
        either_table = tables[2]

        a_definition = self.map_def_classes(r1a_table, either_table)
        b_definition = self.map_def_classes(r1b_table, either_table)

        return a_definition, b_definition

    def get_table_classes(self, table):
        """Return a list of classes from a table."""
        return [
            utils.clean(row.find('a').get('title'))
            for row in table.find('tbody').findAll('tr')
        ]

    def map_def_classes(self, rc_table, either_table):
        """Given a table for R1A or R1B classes and a table of either classes, returns a MapperDefinition with the classes added."""
        definition = MapperDefinition()

        rc_classes = (
            self.get_table_classes(rc_table) +
            self.get_table_classes(either_table)
        )
        for rc in rc_classes:
            splitted = rc.split()
            abbreviation = " ".join(splitted[:-1])
            course_number = splitted[-1]
            definition.add(abbreviation, allowed=[course_number])

        return definition

reading_resource = ReadingResource()
