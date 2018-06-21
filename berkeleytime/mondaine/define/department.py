"""Functions for defining filters for departments."""
from mondaine.entity.definition import ConstraintDefinition
from catalog.models import Course
from mondaine.define.utils import define_course_list
from mondaine.lib import formulas, utils


def define_departments():
    """Define a Playlist for every UC Berkeley department.

    Department lists are defined by taking the list of distinct department
    values for the entire list of courses (which are populated by
    mondaine_catalog).
    """
    departments = sorted(Course.objects.values_list("department", "abbreviation").distinct(), key=lambda x: x[0])  # noqa
    for department, abbreviation in departments:
        if utils.is_abbreviation(department):
            department = utils.abbreviation_to_department(department)
        if department:
            define_course_list(
                category="department",
                playlist_name=department,
                definition=ConstraintDefinition(
                    constraints=[formulas.abbreviation_in([abbreviation])]
                )
            )
