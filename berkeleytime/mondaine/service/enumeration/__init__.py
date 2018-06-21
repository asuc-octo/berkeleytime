"""Abstract class for Playlist names."""
from enum import Enum


class PlaylistName(Enum):
    """Abstract class."""

    def __str__(self):  # noqa
        return self.value
