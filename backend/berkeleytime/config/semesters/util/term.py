"""Term utils."""
from importlib import import_module


def get_sis_term_id(semester, year):
    """Return the sis term id for the given semester and year."""
    module = import_module(
        'berkeleytime.config.semesters.{0}{1}'.format(semester, year)
    )
    return module.SIS_TERM_ID
