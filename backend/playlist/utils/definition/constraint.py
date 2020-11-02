"""Constraint definition."""
from playlist.utils.definition.definition import Definition


class ConstraintDefinition(Definition):
    """A definition that is satisfied iff all its constraints are satisfied."""

    def __init__(self, constraints=None):
        """Initialize with constraints.

        :param constraints: List of constraints (functions that take a
            entity.Course and returns True if the course satisfies the
            constraint).
        """
        self.constraints = constraints if constraints else []

    def satisfies(self, course):
        """Return True if all of the constraint functions are satisfied."""
        return all([constraint(course) for constraint in self.constraints])
