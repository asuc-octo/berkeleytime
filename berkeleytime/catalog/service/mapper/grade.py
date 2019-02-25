"""Let's format the spreadsheets rather than having customized code."""
import nameparser

from data.service.entity.grade import Grade
from data.lib.grade import get_letter_grades
from data.lib.grade import letter_grade_to_gpa
from data.lib.grade import letter_grade_to_field_name

grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "P", "NP"]

class GradeMapper(object):
    """Mapper for entity.Grade."""

    def map(self, data, extras):
        """Take a row in a CSV and return an entity.Grade."""
        data = {k: v.strip() for k, v in data.iteritems()}

        grade = {
            'abbreviation': data["Subject"].strip().upper(),
            'course_number': data["ClassNum"].strip().upper(),
            'section_number': data["Section"].strip().upper(),
        }

        total_samples = self.get_total(data)
        if total_samples == 0:
            return

        grade.update({'total': total_samples})
        grade.update(self.get_letter_grades(data))
        grade.update(self.get_instructor_name(data))
        grade.update(self.get_p_np(data))
        grade.update(extras)

        return Grade(grade)

    def get_total(self, data):
        """Get the total number of students who take this class."""
        # Sum all students from [A+, Incomplete) not including Incomplete
        # but including everything else (A+...F, P, NP, Unsatisfactory, etc)
        return sum([int(data[x]) for x in grades if x in data])

    def get_letter_grades(self, data):
        """Parse all letter grade values from data (e.g. A+, A, A-)."""
        result = dict()
        total_gpa, total_letter_grades = 0, 0

        for _, letter in enumerate(get_letter_grades()):
            value = data[letter]
            count = int(value) if value.isdigit() else 0

            result[letter_grade_to_field_name(letter)] = count
            total_gpa += float(count * letter_grade_to_gpa(letter))
            total_letter_grades += count

        if total_letter_grades != 0:
            result['average'] = total_gpa / total_letter_grades

        return result

    def get_instructor_name(self, data):
        """Fucking Berkeley administrators doing stupid shit.

        Return instructor name formatted: ZHU, Y (LAST, F.)
        """
        # instructor names are delimited by ; and sorted alphabetically
        # randomly take the first one instructor, this might be a monkey
        instructor = data["Instructor"].split(';')[0]

        if instructor == '':
            return {'instructor': instructor}
        name = nameparser.HumanName(instructor)
        if name.first.upper():
            first_name = name.first.upper()[0]
        else:
            first_name = ""
        return {
            'instructor': '%s, %s' % (name.last.upper(), first_name)
        }

    def get_p_np(self, data):
        """Return extra grade fields if they exist (e.g. P, NP, Incomplete)."""
        if not len(data) > 17:
            return {}

        return {
            'p': int(data["P"]) if data["P"].isdigit() else 0,
            'np': int(data["NP"]) if data["NP"].isdigit() else 0,
        }

    def get_letter_grade_key(self, letter):
        """Take a letter grade and transforms it to an entity key."""
        if letter == 'F':
            return 'f'

        # Maps A+ to a3, A to a2, A- to a1, and so on
        key = letter.replace('+', '1').replace('-', '3') if len(letter) == 2 else letter + '2'  # noqa
        return key.lower()

grade_mapper = GradeMapper()
