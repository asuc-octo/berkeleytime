"""Entity Mapper."""


class EntityMapper(object):
    """Abstract class which must return a schematic Entity."""

    def map(self, *args, **kwargs):
        """Take arbitrary data and return an Entity."""
        raise NotImplementedError
