"""Grade Entity via Schematics."""

from schematics.models import Model

from schematics.types import FloatType
from schematics.types import IntType
from schematics.types import StringType


class Grade(Model):
    """Grade Entity."""

    id = IntType()  # not set prior to DB entry
    course_id = IntType()  # not set prior to DB entry

    abbreviation = StringType(required=True)
    course_number = StringType(required=True)
    section_number = StringType(required=True)
    instructor = StringType(required=True)
    semester = StringType(required=True)
    year = StringType(required=True)

    a1 = IntType(required=True, default=0)  # A+
    a2 = IntType(required=True, default=0)  # A
    a3 = IntType(required=True, default=0)  # A-
    b1 = IntType(required=True, default=0)  # B+
    b2 = IntType(required=True, default=0)  # B
    b3 = IntType(required=True, default=0)  # B-
    c1 = IntType(required=True, default=0)  # C+
    c2 = IntType(required=True, default=0)  # C
    c3 = IntType(required=True, default=0)  # C-
    d1 = IntType(required=True, default=0)  # D+
    d2 = IntType(required=True, default=0)  # D
    d3 = IntType(required=True, default=0)  # D-
    f = IntType(required=True, default=0)   # F

    p = IntType(default=None)
    np = IntType(default=None)

    total = IntType(required=True)

    # TODO (Yuxin) Remove this -1 bs
    average = FloatType(required=True, default=-1.0)
    letter_average = StringType(required=True)
