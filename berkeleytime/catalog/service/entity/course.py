"""Course Entity via Schematics."""

from schematics.models import Model

from schematics.types import BooleanType
from schematics.types import FloatType
from schematics.types import IntType
from schematics.types import StringType


class Course(Model):
    """Course Entity."""

    id = IntType()  # not set prior to DB entry

    title = StringType(required=True)
    department = StringType(required=True)
    abbreviation = StringType(required=True)
    course_number = StringType(required=True)
    units = StringType()  # no guarantees here
    description = StringType(required=True)

    # Denormalized fields, never manually set these fields EVER
    # https://github.com/yuxinzhu/campanile/wiki/Denormalized-Fields
    grade_average = FloatType(default=-1)
    letter_average = StringType()

    enrolled_percentage = FloatType(default=-1)
    open_seats = IntType(default=-1)
    enrolled = IntType(default=-1)
    enrolled_max = IntType(default=-1)
    waitlisted = IntType(default=-1)

    has_enrollment = BooleanType(default=False)

    # TODO (Yuxin) do we actually need this anymore?
    # primary_kind = models.CharField(max_length=20, null=True, blank=True)
    favorite_count = IntType()
