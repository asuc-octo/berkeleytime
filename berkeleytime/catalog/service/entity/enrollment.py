"""Enrollment Entity via Schematics."""

from schematics.models import Model

from schematics.types import DateTimeType
from schematics.types import IntType


class Enrollment(Model):
    """Enrollment Entity."""

    section_id = IntType()  # this may not be initially set

    enrolled = IntType()
    enrolled_max = IntType()
    waitlisted = IntType()
    waitlisted_max = IntType()

    date_created = DateTimeType()  # this may not be initially set
