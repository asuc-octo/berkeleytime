"""Building Entity via Schematics."""

from schematics.models import Model

from schematics.types import IntType
from schematics.types import FloatType
from schematics.types import StringType


class Building(Model):
    """Building Entity."""

    id = IntType()
    name = StringType(required=True)

    latitude = FloatType(required=True)
    longitude = FloatType(required=True)
