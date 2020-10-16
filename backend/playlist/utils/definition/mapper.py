"""MapperDefinition."""
import pprint

from playlist.utils.definition.constraint import ConstraintDefinition


class MapperDefinition(ConstraintDefinition):
    """A general Definition mapping course.abbreviation : DepartmentDefinition.

    In order to satisfy this definition, course must either:

    1) Satisfy at least one function in self.overrides

    OR

    2) Satisfy every function in self.constraints, and the course number
    must be allowed and not excluded in self.mapper

    Constraints:
    - Course must be at least three units
    """

    def __init__(self, mapper=None, overrides=None, *args, **kwargs):
        """Initialize.

        :param overrides: List of functions taking a course-like entity; course
            automatically satisfies definition if any function in overrides
            returns True
        :param mapper: Dictionary mapping abbreviation to allowed/excluded
            course numbers
        """
        super(MapperDefinition, self).__init__(*args, **kwargs)
        self.overrides = overrides if overrides else []
        self.mapper = mapper if mapper else dict()

    def add(self, abbreviation, allowed=None, excluded=None):
        """Add an abbreviation and corresponding allowable/excluded course_numbers."""
        allowed = set(allowed) if allowed else set()
        excluded = set(excluded) if excluded else set()

        if abbreviation not in self.mapper:
            self.mapper[abbreviation] = {
                "allowed": allowed,
                "excluded": excluded,
            }
        else:
            previously_allowed = self.mapper[abbreviation]["allowed"]
            previously_excluded = self.mapper[abbreviation]["excluded"]
            allowed = previously_allowed.union(allowed)
            excluded = previously_excluded.union(excluded)

            # Check that a course number does not simultaneously appear
            # in allowed and excluded course numbers
            if allowed.intersection(excluded):
                raise Exception(
                    "Adding allowed = %s, excluded = %s caused"
                    " courses to be both allowed and excluded"
                    % (allowed, excluded)
                )

            self.mapper[abbreviation] = {
                "allowed": allowed,
                "excluded": excluded,
            }

    def satisfies(self, course):
        """Return True if the given Course object satisfies this definition."""
        # Return True if any overriding functions are satisfied
        if any([override(course) for override in self.overrides]):
            return True

        # Return False if any of the constraints are not satisfied
        if not super(MapperDefinition, self).satisfies(course):
            return False

        if course.abbreviation not in self.mapper:
            return False

        department_definition = self.mapper[course.abbreviation]
        allowed = department_definition.get("allowed", set())
        excluded = department_definition.get("excluded", set())

        # If there are no allowed course numbers, assume all are allowed
        if len(allowed) == 0:
            return course.course_number not in excluded
        else:
            return (
                course.course_number in allowed and
                course.course_number not in excluded
            )

    def get_all_allowed_courses_set(self):
        all_allowed = set()
        for abbreviation in self.mapper.keys():
            for course_num in self.mapper[abbreviation]["allowed"]:
                all_allowed.add((abbreviation, course_num))
        return all_allowed

    def __str__(self):
        """Return string representation."""
        return pprint.pformat(self.mapper)
