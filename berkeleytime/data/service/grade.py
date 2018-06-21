"""Grade Service."""
from data.service.reader.grade import grade_reader
from data.service.store.grade import grade_store

from catalog.service.section import section_service


class GradeService(object):
    """Application level logic for grade distributions."""

    def update(self, semester=None, year=None):
        """Optionally take a semester/year and update grade distributions."""
        if semester and year:
            self._update(semester, year)
        else:
            for semester, year in grade_reader.get_available_semesters():
                self._update(semester, year)

    def _update(self, semester, year):
        """Update all grades for a single semester, year."""
        failed_grades = []
        for grade in grade_reader.read(semester, year):
            self.update_or_create(grade, failed_grades)

        self.__print_failed_grades(failed_grades)

    # TODO (HOW COME GRADE DATA IS NOT FUCKED IF WE ONLY TAKE THE FIRST PERSONS NAME?)  # noqa
    def update_or_create(self, grade, failed_grades):
        """Update/create a single entity.Grade."""
        # TODO (*) Causes issues for Fall 2016
        # instructor = self.__guess_the_fucking_instructor(grade)
        # grade.instructor = instructor if instructor else grade.instructor
        # print instructor
        # print grade.instructor

        grade_store.update_or_create(grade=grade, failed_grades=failed_grades)

    def __guess_the_fucking_instructor(self, grade):
        """Attempt to retrieve the instructor name from our own records."""
        # Left pad the section number to be at length three
        section_number = grade.section_number
        if len(grade.section_number) < 3:
            section_number = grade.section_number.zfill(3)

        # TODO (*) We should only need to retrieve primary sections here, but
        # some semesters do not have any primary sections
        # https://github.com/yuxinzhu/campanile/issues/197
        sections = section_service.find(
            abbreviation=grade.abbreviation, course_number=grade.course_number,
            section_number=section_number, semester=grade.semester, year=grade.year,  # noqa
        )
        # Filter out sections that don't have instructors, arbitrarily return 1
        sections = [s for s in sections if s.instructor]
        instructor = sections[0].instructor if sections else None

        return instructor

    def __print_failed_grades(self, failed_grades):
        """Print all the grades that failed to make it into the database due to Course object missing.""" # noqa
        for (abbreviation, course_number) in failed_grades:
            print('Failed to update grades for {} {} due to Course object not in database.'.format(abbreviation, course_number)) # noqa

grade_service = GradeService()
