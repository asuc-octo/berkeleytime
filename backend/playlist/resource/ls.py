"""Resource definitions for L&S breadth pages."""
import csv
import requests
import os
from collections import defaultdict

from berkeleytime.settings import (
    SIS_CLASS_APP_ID,
    SIS_CLASS_APP_KEY,
    CURRENT_SEMESTER,
    CURRENT_YEAR,
    PAST_SEMESTERS_SIS,
)
from berkeleytime.config.semesters.util.term import get_sis_term_id
from berkeleytime.config.general import SPECIAL_CHARACTER_ABBREVIATIONS
from catalog.mapper import course_mapper
from playlist.enums import LSPlaylistName
from playlist.utils.definition import MapperDefinition


class LSResource(object):
    """
    Resource for a Letters and Sciences breadth requirement page.
    Includes data for current and past semesters.
    """
    csvs = {
        str(LSPlaylistName.arts_and_literature): 'arts_literature',
        str(LSPlaylistName.biological_science): 'biological_science',
        str(LSPlaylistName.historical_studies): 'historical_studies',
        str(LSPlaylistName.international_studies): 'international_studies',
        str(LSPlaylistName.philosophy_and_values): 'philosophy_values',
        str(LSPlaylistName.physical_science): 'physical_science',
        str(LSPlaylistName.social_and_behavior_sciences): 'social_behavioral_sciences',
    }
    breadths = csvs.keys()
    semester_data = (
        PAST_SEMESTERS_SIS + [{'semester': CURRENT_SEMESTER, 'year': CURRENT_YEAR}]
    )
    # Max page size is 100. We only want courses that are marked as active.
    url = 'https://apis.berkeley.edu/sis/v1/classes/sections?term-id=%s&page-number=%s&page-size=100&status-code=A'
    headers = {
        'accept': 'application/json',
        'app_id': SIS_CLASS_APP_ID,
        'app_key': SIS_CLASS_APP_KEY
    }

    def get(self, playlist_name):
        """
        We get our data from SIS. However, since fetching and processing is very slow, we cache our fetched data in
        csv format and prefer to use the cached csv's if they exist instead of fetching from SIS.
        Args:
            playlist_name (str): name of the playlist
        Returns:
            breadth_defs: list of (semester, year, definition). Returns all courses that satisfy the given breadth in each past and current semester.
        """
        self._maybe_fetch_from_sis()
        breadth_defs = list()
        for data in self.semester_data:
            semester, year = data['semester'], data['year']
            filename = self.csvs.get(str(playlist_name))
            filepath = f'cached_data/ls/{semester}_{year}/{filename}.csv'
            print("Found cached data: " + filepath)
            definition = self.handler(filepath)
            if definition:
                breadth_defs.append((semester, year, definition))
            else:
                print("filepath does not exist:", filepath)
        return breadth_defs

    def refresh_current_semester(self):
        """
        Fetch courses that satisfy L&S breadths in the current semester from SIS, overwriting the cache.
        """
        print(f"Refreshing data from SIS for the current semester: {CURRENT_SEMESTER} {CURRENT_YEAR}")
        breadth_to_courses = self._get_sis(CURRENT_SEMESTER, CURRENT_YEAR)
        self._write_csv(CURRENT_SEMESTER, CURRENT_YEAR, breadth_to_courses)

    def _maybe_fetch_from_sis(self):
        """
        Fetching and processing data from SIS is extremely slow (1+ hr for all past semesters), so we cache the
        fetched data in CSV files.
        """
        for data in self.semester_data:
            for playlist_name in self.breadths:
                semester = data['semester']
                year = data['year']
                rel_path = '%s/%s/%s.csv' % ('cached_data/ls', semester + '_' + year, self.csvs.get(playlist_name))
                csv_path = os.path.join(os.path.dirname(__file__), rel_path)
                if not os.path.exists(csv_path):
                    breadth_to_courses = self._get_sis(semester, year)
                    self._write_csv(semester, year, breadth_to_courses)
                    break

    def _write_csv(self, semester, year, breadth_to_courses):
        """
        Write the processed breadth-to-course mapping in CSV files for a given semester.
        """
        rel_path = '%s/%s' % ('cached_data/ls', semester + '_' + year)
        dir_path = os.path.join(os.path.dirname(__file__), rel_path)
        if not os.path.exists(dir_path):
            os.mkdir(dir_path)
        for breadth, courses in breadth_to_courses.items():
            rel_path = '%s/%s/%s.csv' % ('cached_data/ls', semester + '_' + year, self.csvs.get(breadth))
            csv_path = os.path.join(os.path.dirname(__file__), rel_path)
            f = open(csv_path, "w")
            for course in courses:
                f.write(course + "\n")
            print("Wrote " + str(len(courses)) + " courses to " + csv_path)
            f.close()

    def _get_sis(self, semester, year):
        """
        Args:
            semester (str): the semester to look up
            year (str): the year to look up
        Returns:
            breadth_to_def (dict): Dictionary mapping of breadth name to definition.
        """
        print(f"Fetching L&S Breadths from SIS for {semester} {year} (this may take some time)...")
        term_id = get_sis_term_id(semester=semester, year=year)
        breadth_to_courses = dict()
        for b in self.breadths:
            breadth_to_courses[self._abbreviate_breadth_name(b)] = set()

        # Process pages until there are none left. The data is very large so we must fetch it incrementally
        # by splitting it up into pages.
        page_num = 1  # Starts at 1, not 0.
        while self._process_page(breadth_to_courses, term_id, page_num):
            if page_num % 10 == 0:
                print(f"{semester} {year} pages read: {str(page_num)}")
            page_num += 1

        # Convert back to the full name of each breadth.
        breadth_to_courses_full = dict()
        for full_name in self.breadths:
            breadth_abbrv = self._abbreviate_breadth_name(full_name)
            breadth_to_courses_full[full_name] = breadth_to_courses[breadth_abbrv]
        return breadth_to_courses_full

    def _process_page(self, breadth_to_courses, term_id, page_num):
        """
        Args:
            breadth_to_courses (dict): Dictionary mapping of abbreviated breadth name to
                set of course abbreviation + number
            term_id (int): ID of the term to process, e.g. 2202 for Spring 2020
            page_num (int): which page to process, >= 1
        Returns:
            (bool) True if we should continue looking, False if there are no more courses left.
        """
        try:
            response = requests.get(self.url % (term_id, page_num), headers=self.headers, timeout=10.0)
        except Exception as e:
            print("Exception fetching class section data from SIS: ", e)
            return False
        if response.status_code != 200:
            if page_num == 1:
                print("Term not found: " + str(term_id))
            print("Finished fetching " + str(page_num-1) + "pages. Status code: " + str(response.status_code))
            return False
        for section in response.json()['apiResponse']['response']['classSections']:
            try:
                course_abbrv = course_mapper.get_abbreviation_and_department(section['class']['course'])['abbreviation']
                course_number = section['class']['course']['catalogNumber']['formatted']
                if 'sectionAttributes' in section:
                    for attr in section['sectionAttributes']:
                        if 'attribute' in attr and 'description' in attr['attribute'] \
                                and 'value' in attr and 'description' in attr['value']:
                            attribute = attr['attribute']['description']
                            breadth_abbrv = self._abbreviate_breadth_name(attr['value']['description'])
                            if attribute == 'Breadth' and breadth_abbrv in breadth_to_courses.keys():
                                breadth_to_courses[breadth_abbrv].add(course_abbrv + "," + course_number)
            except Exception as e:
                print(e)

        return True

    def handler(self, csv_rel_path):
        definition = MapperDefinition()

        csv_path = os.path.join(os.path.dirname(__file__), csv_rel_path)
        if not os.path.exists(csv_path):
            return None

        with open(csv_path, 'r') as csv_file:
            curr_csv = csv.reader(csv_file)
            dept_to_course_num = defaultdict(set)
            for line in curr_csv:
                abbreviation, course_number = None, None
                if len(line) == 2:
                    abbreviation = line[0]
                    course_number = line[1]
                elif len(line) == 3:
                    abbreviation = (line[0] + "," + line[1]).replace("\"", "")
                    course_number = line[2]
                if abbreviation and course_number:
                    dept_to_course_num[abbreviation].add(course_number)

            for abbreviation, course_numbers in dept_to_course_num.items():
                definition.add(
                    abbreviation=self._normalize_abbreviation(abbreviation),
                    allowed=list(course_numbers)
                )

        return definition


    @staticmethod
    def _normalize_abbreviation(abbreviation):
        """Return the abbreviation with special characters (if it has them)"""
        return SPECIAL_CHARACTER_ABBREVIATIONS.get(abbreviation, abbreviation)


    @staticmethod
    def _abbreviate_breadth_name(breadth_name):
        """
        Use first 4 characters to identify each breadth because SIS uses '&' instead of 'and'.
        e.g. 'Arts & Literature' instead of 'Arts and Literature'
        Args:
            breadth_name (str): The full breadth name, e.g. "Arts & Literature" or "Arts and Literature"
        Returns:
            abbreviated name (str): e.g. "Arts"
        """
        return breadth_name[:4]


ls_resource = LSResource()
