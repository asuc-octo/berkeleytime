"""Resources for parsing the American Cultures requirement website."""
import csv
import re
import os
import sys
from collections import defaultdict
from urllib.request import urlopen

from bs4 import BeautifulSoup

from catalog.models import Course
from playlist.utils import utils
from playlist.utils.definition import MapperDefinition

class AmericanCulturesResource:
    """Resource for American Cultures requirement."""

    url = 'https://academic-senate.berkeley.edu/committees/amcult/approved-berkeley'
    override_filepath = os.path.join(os.path.dirname(__file__), 'cached_data/american_cultures/american_cultures_override.csv')

    def get(self):
        """Return a Mapper Definition for the American Cultures Requirement"""
        definition = MapperDefinition()
        definition = self.parse_page(definition)
        definition_with_overrides = self.parse_overrides(definition)
        return definition_with_overrides


    def parse_page(self, definition):
        """Given a table of classes, returns a MapperDefinition with the classes added."""
        html = urlopen(self.url).read()
        bs = BeautifulSoup(html, 'html.parser')
        departments = bs.find_all(class_='openberkeley-collapsible-container')
        for dept in departments:
            try:
                abbrev = self.parse_abbrev(dept)
                assert abbrev is not None, 'Cannot parse American Cultures department'
                course_numbers = self.parse_course_numbers(dept)
            except:
                print('Could not parse American Cultures requirement:',
                      dept, file=sys.stderr)
                continue
            for course_number in course_numbers[:]:
                if not Course.objects.filter(
                        abbreviation=abbrev,
                        course_number=course_number).exists():
                    course_numbers.remove(course_number)
            if len(course_numbers) > 0:
                definition.add(abbrev, allowed=course_numbers)
        return definition


    def parse_abbrev(self, dept):
        dept_name_raw = re.split('[\—(\–]', dept.find('span').text)[0]
        dept_name = re.sub('[\"\'’]', '', dept_name_raw).strip()
        return utils.department_to_abbreviation(dept_name)


    def parse_course_numbers(self, dept):
        course_numbers = []
        courses = dept.find_all('p')
        for course in courses:
            if not course.find('span'):
                continue
            course_number_raw = course.find('span').text
            course_number_raw = re.split('[ \xa0]', course_number_raw)[0]
            course_number_stripped = re.sub('\W+', '', course_number_raw).strip()
            course_numbers.append(course_number_stripped)
        return course_numbers


    def parse_overrides(self, definition):
        override_dict = defaultdict(list)
        with open(self.override_filepath, 'r') as csv_file:
            csv_reader = csv.reader(csv_file)
            for line in csv_reader:
                abbrev, course_number = line[0], line[1]
                if not Course.objects.filter(
                        abbreviation=abbrev,
                        course_number=course_number).exists():
                    continue
                override_dict[abbrev].append(course_number)
        for abbrev in override_dict:
            definition.add(abbrev, allowed=override_dict[abbrev])
        return definition


american_cultures_resource = AmericanCulturesResource()
