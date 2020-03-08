"""Playlist Entity via Schematics."""

from schematics.models import Model

from schematics.types import IntType
from schematics.types import StringType


class Playlist(Model):
    """Playlist Entity."""

    id = IntType()  # not set prior to DB entry

    name = StringType(required=True)
    category = StringType(required=True)
    semester = StringType(required=False)
    year = StringType(required=False)

    # We intentionally do not store courses since that is a M2M table
