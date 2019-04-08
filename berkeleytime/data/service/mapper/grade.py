"""Let's format the spreadsheets rather than having customized code."""
import nameparser

from data.service.entity.grade import Grade
from data.lib.grade import get_letter_grades
from data.lib.grade import letter_grade_to_gpa
from data.lib.grade import letter_grade_to_field_name

def convert_section_num(x):
    str_rep = str(x)
    while str_rep[0] == "0":
        str_rep = str_rep[1:]
    return str_rep

class GradeMapper(object):
    """Mapper for entity.Grade."""

    def map(self, data, extras):
        """Take a row in a CSV and return an entity.Grade."""
        data = [x.strip() for x in data]
        print data
        grade = {
            'abbreviation': data[0].strip().upper(),
            'course_number': data[1].strip().upper(),
            'section_number': convert_section_num(data[3].strip()).upper(),
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
        return sum([int(x) if x.isdigit() else 0 for x in data[7:]])

    def get_letter_grades(self, data):
        """Parse all letter grade values from data (e.g. A+, A, A-)."""
        result = dict()
        total_gpa, total_letter_grades = 0, 0

        for index, letter in enumerate(get_letter_grades()):
            value = data[7 + index]
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
        instructor = data[5].split(';')[0]

        if instructor == '':
            return {'instructor': instructor}
        name = nameparser.HumanName(instructor)
        return {
            'instructor': '%s, %s' % (name.last.upper(), name.first.upper()[0])
        }

    def get_p_np(self, data):
        """Return extra grade fields if they exist (e.g. P, NP, Incomplete)."""
        if not len(data) > 20:
            return {}

        return {
            'p': int(data[20]) if data[20].isdigit() else 0,
            'np': int(data[21]) if data[21].isdigit() else 0,
        }

    def get_letter_grade_key(self, letter):
        """Take a letter grade and transforms it to an entity key."""
        if letter == 'F':
            return 'f'

        # Maps A+ to a3, A to a2, A- to a1, and so on
        key = letter.replace('+', '1').replace('-', '3') if len(letter) == 2 else letter + '2'  # noqa
        return key.lower()

grade_mapper = GradeMapper()
