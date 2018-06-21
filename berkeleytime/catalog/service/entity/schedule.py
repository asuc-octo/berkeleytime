"""Schedule EntityCollection."""
from catalog.service.entity import ModelCollection


class Schedule(ModelCollection):
    """A collection of entities to accomodate SIS's bad design patterns."""

    def __init__(self, section, enrollment, location):
        """All of these are entities."""
        self.section = section
        self.enrollment = enrollment
        self.location = location
