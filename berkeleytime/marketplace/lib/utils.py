"""Marketplace utils."""


def semester_year_to_term_key(semester, year):
    """Given a semester and year, return a term key for bookstore terms.

    'fall', '2017' -> FALL 2017
    """
    return '{} {}'.format(semester.upper(), year)
