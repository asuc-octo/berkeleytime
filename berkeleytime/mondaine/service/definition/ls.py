"""Definition for an L&S breadth requirement."""

from mondaine import config
from mondaine.lib import formulas
from mondaine.service.definition.mapper import MapperDefinition


class LSBreadthDefinition(MapperDefinition):
    """Definition for a College of Letters and Sciences breadth."""

    def __init__(self, *args, **kwargs):
        """Initialize."""
        super(LSBreadthDefinition, self).__init__(*args, **kwargs)

        self.constraints = [formulas.gte_n_units(units=3)]


class SBSLSBreadthDefinition(MapperDefinition):
    """Societal and Behavioral sciences definition for L&S.

    Ethnic Studies and Letters and Science classes are hardcoded, since classes
    noted as "C 126" (with a space) break the regular parser.
    """

    def __init__(self, *args, **kwargs):
        """Initialize."""
        super(SBSLSBreadthDefinition, self).__init__(*args, **kwargs)

        self.abbreviation_to_allowed_course_numbers = {
            "ETH STD": config.get("course_numbers.ls.sbs.ethnic_studies"),
            "L & S": config.get("course_numbers.ls.sbs.ls")
        }
        self.overrides = [self.special_case]

    def _special_case(self, course):
        """Define a special case hardcoding allowed course numbers."""
        if course.abbreviation in self.abbreviation_to_course_numbers:
            return (
                course.course_number in
                self.abbreviation_to_allowed_course_numbers
            )
        return False
