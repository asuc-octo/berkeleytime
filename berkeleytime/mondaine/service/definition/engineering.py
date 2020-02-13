"""Engineering humanities and social sciences definition."""
from mondaine import config

from mondaine.lib import formulas
from mondaine.service.definition.constraint import ConstraintDefinition


class EngineeringDefinition(ConstraintDefinition):
    """A Definition for CoE Humanities and Social Sciences.

    In order to satisfy this definition, a course must:

    1) Satisfy one of the following LSBreadthDefinitions:
        - Arts and Literature
        - Historical Studies
        - International Studies
        - Philosophy and Values
        - Social and Behavioral Science
    OR
    2) Be on an list of foreign language courses approved by the CoE.

    Constraints:
        - Course must be at least three units
        - Course must not be in Engineering
        - Course number must not be 97, 98, 99, or above 196

    Overrides:
        - BIO ENG 100, COMPSCI C79, ENGIN 125, ENGIN 157AC, ENGIN 185, or MEC ENG 191K.
    """

    def __init__(self, definitions, *args, **kwargs):
        """Initialize.

        :param definitions: List of L&S breadth definitions (see ls.py)
                            and foreign language courses (foreign_language.py)
        """
        super(EngineeringDefinition, self).__init__(*args, **kwargs)
        self.constraints = [
            formulas.gte_n_units(n=3),
            formulas.not_in_abbreviations(
                config.get("engineering.abbreviations")
            ),
            self._not_in_course_numbers(["97", "98", "99"]),
            self._not_in_course_numbers(["197", "198", "199"]),
        ]

        self.overrides = [
            formulas.course_in([
                "BIO ENG 100",
                "COMPSCI C79",
                "ENGIN 125",
                "ENGIN 157AC",
                "ENGIN 185",
                "MEC ENG 191K",
            ])
        ]
        self.definitions = definitions

    def _not_in_course_numbers(self, course_numbers):
        def satisfies(course):
            return (
                course.course_number not in course_numbers
            )
        return satisfies

    def satisfies(self, course):
        """Return True if the given Course object satisfies this definition."""
        # Return True if any overriding functions are satisfied
        if any([override(course) for override in self.overrides]):
            return True

        # If the constraints are not satisfied, return false
        if not super(EngineeringDefinition, self).satisfies(course):
            return False

        # If overrides were not satisfied but constraints were, return true if
        # any of the L&S breadths are satisfied.
        return any([
            definition.satisfies(course) for definition in self.definitions
        ])
