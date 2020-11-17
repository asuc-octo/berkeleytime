"""Base abstract definition class."""

class Definition(object):
    """A Definition is anything which implements a satisfies method."""

    def satisfies(self, course):
        """Return True if the given course model satisfies the definition."""
        raise NotImplementedError
