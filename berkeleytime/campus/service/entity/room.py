"""Room Entity via Schematics."""

from schematics.models import Model

from schematics.types import IntType
from schematics.types import StringType


class Room(Model):
    """Room Entity."""

    # this may not be initially set
    id = IntType()
    building_id = IntType()

    name = StringType(required=True)
