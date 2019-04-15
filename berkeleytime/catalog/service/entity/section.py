"""Section Entity via Schematics."""

from schematics.models import Model

from schematics.types import BooleanType
from schematics.types import DateTimeType
from schematics.types import IntType
from schematics.types import StringType


class Section(Model):
    """Section Entity."""

    id = IntType()  # not set prior to DB entry

    course_id = IntType(required=True)
    cs_course_id = StringType(required=True)

    semester = StringType(required=True)
    year = StringType(required=True)

    abbreviation = StringType(required=True)
    course_number = StringType(required=True)
    course_title = StringType(required=True)

    ccn = StringType(required=True)

    section_number = StringType(required=True)
    kind = StringType(required=True)
    is_primary = BooleanType(required=True)

    days = StringType()
    start_time = DateTimeType()
    end_time = DateTimeType()

    location_name = StringType()

    instructor = StringType()

    enrolled = IntType()
    enrolled_max = IntType()
    waitlisted = IntType()
    waitlisted_max = IntType()

    rank = IntType(required=True)
    suffix = StringType(required=True)

    disabled = BooleanType(default=False)

    final_day = StringType()
    final_start = DateTimeType()
    final_end = DateTimeType()

    @property
    def word_days(self):
        """TODO (Yuxin) This should be deprecated."""
        word = ""
        # Right now both 0 and 7 map to Sunday. 0 is now the canonical number
        # representing Sunday in the database. 7 is included for backwards
        # compatibility
        days = {"0": "Su", "1": "M", "2": "Tu", "3": "W", "4": "Th", "5": "F", "6": "Sa", "7": "Su"}  # noqa
        for integer in self.days:
            word += days[integer]
        return word

    @property
    def final_word_day(self):
        """The string representation of the last day this course is offered on.

        TODO (Christine) idk why word_days needs to be deprecated but if it is,
        this should be deprecated too.
        """
        days = {"0": "Su", "1": "M", "2": "Tu", "3": "W", "4": "Th", "5": "F", "6": "Sa", "7": "Su"}  # noqa
        return days[self.final_day]

    def as_json(self):
      return dict(
        id = self.id,
        enrolled = self.enrolled,
        enrolled_max = self.enrolled_max,
        section_number = self.section_number,
        kind = self.kind,
        ccn = self.ccn,
        start_time = self.start_time.isoformat() if self.start_time else '' ,
        end_time = self.end_time.isoformat() if self.end_time else '',
        word_days = self.word_days if self.days else '',
        location_name = self.location_name,
        instructor = self.instructor,
        waitlisted = self.waitlisted,
        final_day = self.final_day,
        final_start = self.final_start.isoformat() if self.final_start else '',
        final_end = self.final_end.isoformat() if self.final_end else '',
      )
