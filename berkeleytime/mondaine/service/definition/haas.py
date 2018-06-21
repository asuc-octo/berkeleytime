"""Definition for Hass breadth."""
from mondaine import config

from mondaine.service.definition.constraint import ConstraintDefinition
from mondaine.lib import formulas


class HaasBreadthDefinition(ConstraintDefinition):
    """A definition for one Haas breadth requirement.

    To satisfy this definition, course must satisfy all:

    1. Must satisfy the corresponding LS breadth definition

    Constraints:
        1. Course must be at least three units
        2. Must not be a business course
        3. Econ 1/2/3/100{A|B}/101{A|B}, IAS 106/107 prohibited
        4. Course cannot satisfy R1A/R1B

    Note: Haas breadths map 1-1 with L&S breadths.
    """

    def __init__(
        self,
        ls_definition,
        excluded_definitions=None,
        *args, **kwargs
    ):
        """Instantiate with definitions for a given LS breadth.

        :param ls_definition: The corresponding L&S breadth definition.
        :param excluded_definitions: Optional definitions which the course
            must NOT satisfy.
        """
        super(HaasBreadthDefinition, self).__init__(*args, **kwargs)

        self.ls_definition = ls_definition

        self.constraints = [
            formulas.gte_n_units(n=3),
            formulas.not_in_abbreviations(config.get('haas.abbreviations')),
            formulas.course_not_in([
                'ECON 1', 'ECON 2', 'ECON 3', 'ECON 100A', 'ECON 100B',
                'ECON 101A', 'ECON 101B', 'IAS 106', 'IAS 106'
            ])
        ]
        if excluded_definitions:
            self.constraints.append(
                formulas.not_in_definitions(excluded_definitions)
            )

    def satisfies(self, course):
        """Return whether the given course satisfies this requirement."""
        if not super(HaasBreadthDefinition, self).satisfies(course):
            return False

        if not self.ls_definition.satisfies(course):
            return False
        return True
