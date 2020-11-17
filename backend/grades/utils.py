"""Super handy functions for grade information."""

LETTER_GRADES = [
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
    'F': 0.0,
    '': -0.1,
}


def letter_grade_to_gpa(letter_grade):
    """Take a letter grade (e.g. A+) and convert it to a GPA float."""
    return _LETTER_GRADE_TO_GPA[letter_grade]


def gpa_to_letter_grade(gpa):
    """Take GPA float (e.g. 3.2) and calculate the closest letter grade."""
    return min((abs(gpa - v), k) for k, v in _LETTER_GRADE_TO_GPA.items())[1]


def letter_grade_to_field_name(letter_grade):
    """Take a letter grade (e.g. A+) and convert it to field name (e.g. a3)."""
    if letter_grade in ['F', 'P', 'NP']:
        return letter_grade.lower()

    # Maps A+ to a3, A to a2, A- to a1, and so on
    if len(letter_grade) == 2:
        return letter_grade.replace('+', '1').replace('-', '3').lower()

    return (letter_grade + '2').lower()


def add_up_grades(grades):
    """Takes a list of Grade objects (from catalog.models) and finds
        1) the weighted letter grade counter i.e. the total number of A+, A, A-, ..., F
           in the combined sections
        2) the total number of grades in the combined sections
    """
    # Counter for letter grades weighted by their GPA value (e.g. 100 * B+ 3.3)
    weighted_letter_grade_counter = {lg: 0 for lg in LETTER_GRADES}
    total = 0

    # Sum up all letter grades across all models.Grade
    for grade in grades:
        for letter_grade in weighted_letter_grade_counter.keys():
            field_name = letter_grade_to_field_name(letter_grade)
            count = getattr(grade, field_name)
            total += count

            weighted_letter_grade_counter[letter_grade] += count * letter_grade_to_gpa(letter_grade)

    return weighted_letter_grade_counter, total
