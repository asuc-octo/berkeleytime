"""Promotion Entity via Schematics."""
from schematics.models import Model
from schematics.types import IntType
from schematics.types import StringType


class Promotion(Model):
    """Promotion Entity."""

    id = IntType()  # not set prior to DB entry

    title = StringType(required=True)
    description = StringType()

    image_url = StringType(required=True)
    tracking_pixel_url = StringType(required=True)
    url = StringType(required=True)
