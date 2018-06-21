"""Enums of Playlist Names."""
from enum import Enum


class PlaylistCategory(Enum):
    """Playlist categories."""

    haas = 'haas'
    ls = 'ls'
    reading = 'reading'
    university = 'university'
    units = 'units'
    level = 'level'
    engineering = 'engineering'
    department = 'department'
    semester = 'semester'

    def __str__(self):  # noqa
        return self.value
