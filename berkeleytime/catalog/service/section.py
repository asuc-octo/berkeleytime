"""Section Service."""
from catalog.service.store.section import section_store


class SectionService(object):
    """Application logic for Section."""

    def find_abbreviations(self, semester, year):
        """Return all existing abbreviations in a given semester/year."""
        return section_store.find_abbreviations(semester=semester, year=year)

    def update_or_create(self, section):
        """Update or create a single section."""
        return section_store.update_or_create(section=section)

    def find(self, semester, year, abbreviation=None, course_number=None, section_number=None):  # noqa
        """Given some parameters, return a list of matching entity.Section."""
        # There are sections with the same section number but different kind
        return section_store.find(
            abbreviation=abbreviation,
            course_number=course_number,
            section_number=section_number,
            semester=semester,
            year=year,
        )

    def find_by_course_id(
        self, course_id, semester=None, year=None, is_primary=None
    ):
        """Given a (course_id, semester, year) find all sections that match."""
        return section_store.find_by_course_id(
            course_id, semester, year, is_primary
        )

    def exists(self, semester, year):
        """Given a semester, year, return True if there sections exist."""
        return section_store.exists(
            semester=semester, year=year,
        )

    def set_textbooks(self, sis_section_id, semester, year, textbook_ids):
        """Set a series of textbooks for a single course.

        :param str sis_section_id: The section id from SIS of the section to
            set.
        :param str semester: Semester to set for. Necessary since section
            SIS section id is not necessarily unique across semesters/years.
        :param str year: Year to set for. Necessary since section SIS section
            id is not necessarily unique across semesters/years.
        :param list<int> textbook_ids: List of berkeleytime ids of textbooks
            to set.
        """
        section_store.set_textbooks(
            ccn=sis_section_id,
            semester=semester,
            year=year,
            textbook_ids=textbook_ids,
        )

    def find_textbooks_by_section_id(self, section_id):
        """Retrieve the textbooks for a single section.

        :param int section_id:
        :returns <list<entity.Textbook>>:
        """
        return section_store.find_textbooks_by_section_id(section_id)

section_service = SectionService()
