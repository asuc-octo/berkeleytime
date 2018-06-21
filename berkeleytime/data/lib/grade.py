"""Super handy functions for grade information."""

_LETTER_GRADES = [
    'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'
]

_LETTER_GRADE_TO_GPA = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'D-': 0.7,
    'F': 0.0,  # f is f, sucks to sucks
}


def get_letter_grades():
    """Return a list of letter grades."""
    return _LETTER_GRADES


def letter_grade_to_gpa(letter_grade):
    """Take a letter grade (e.g. A+) and convert it to a GPA float."""
    return _LETTER_GRADE_TO_GPA[letter_grade]


def letter_grade_to_field_name(letter_grade):
    """Take a letter grade (e.g. A+) and convert it to field name (e.g. a3)."""
    if letter_grade == 'F':
        return 'f'

    # Maps A+ to a3, A to a2, A- to a1, and so on
    if len(letter_grade) == 2:
        return letter_grade.replace('+', '1').replace('-', '3').lower()

    return (letter_grade + '2').lower()


def gpa_to_letter_grade(gpa):
    """Take GPA float (e.g. 3.2) and calculate the closest letter grade."""
    return min((abs(gpa - v), k) for k, v in _LETTER_GRADE_TO_GPA.items())[1]
