"""Exceptions mondaine might throw."""


class MondaineException(Exception):
    """General exception from Mondaine."""

    pass


class DefinitionException(MondaineException):
    """Exception relating to a Mondaine Definition."""

    pass


class ResourceException(MondaineException):
    """Exception relating to grabbing a resourse from the internet."""

    pass
