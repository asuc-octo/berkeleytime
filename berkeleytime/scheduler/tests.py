from django.test import TestCase
from catalog.models import Course
from scheduler.lib.schedule_csp import ScheduleCSP
from scheduler.views import parse_sections_ccns, parse_constraint_bits

from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR

from datetime import datetime
import time

# Constants for data generation, values chosen randomly to have consistent tests
C_YEAR = 2000
C_MONTH = 1
C_DAY = 1

# Default constraints
DEFAULT_CONSTRAINT_BITS = parse_constraint_bits(['0' for _ in range(13)])


def time_block(hour=8, minute=0, second= 0):
    return datetime(C_YEAR, C_MONTH, C_DAY,
                    hour=hour, minute=minute, second=second)


def get_csp(selected_dict, parsed_constraint_bits):
    return ScheduleCSP(
        selected_dict,
        parsed_constraint_bits[0],
        parsed_constraint_bits[2],
        parsed_constraint_bits[1]
    )


class SchedulerTestWrapper(TestCase):

    def check_num_schedules(self, schedule_list, num):
        self.assertEqual(len(schedule_list), num, "Should produce {0} schedules.".format(num))


def create_section(course, **kwargs):
    """
    Create a section object under a course with certain defaults
    @param course: Course object that the section belongs
    @param kwargs: Keyword arguments for section attributes
    @return: Section Object
    """
    return course.section_set.create(
        year=CURRENT_YEAR,
        semester=CURRENT_SEMESTER,
        **kwargs
    )

class TestBasic(SchedulerTestWrapper):
    def setUp(self):
        cs10 = Course.objects.create(abbreviation="COMPSCI", course_number="10")
        cs61A = Course.objects.create(abbreviation="COMPSCI", course_number="61A")
        cs61B = Course.objects.create(abbreviation="COMPSCI", course_number="61B")
        cs61C = Course.objects.create(abbreviation="COMPSCI", course_number="61C")
        # 8:00 - 9:30, TTH
        self.cs10_lec1 = create_section(
            course=cs10,
            abbreviation="COMPSCI",
            course_number="10",
            kind="lec",
            start_time=time_block(8, 10, 0),
            end_time=time_block(9, 30, 0),
            days="24",
            is_primary=True,
            ccn='10001'
        )
        # 14:00 - 15:00, MWF
        self.cs10_sec1 = create_section(
            course=cs10,
            abbreviation="COMPSCI",
            course_number="10",
            kind="dis",
            start_time=time_block(14, 0, 0),
            end_time=time_block(15, 0, 0),
            days="135",
            is_primary=False,
            ccn='10002'
        )

        # 18:30 - 20:00, TTH
        self.cs61A_lec1 = create_section(
            course=cs61A,
            abbreviation="COMPSCI",
            course_number="61A",
            kind="lec",
            start_time=time_block(18, 29, 17),
            end_time=time_block(20, 10, 29),
            days="24",
            is_primary=True,
            ccn='20001'
        )
        # 10:00 - 11:30, MWF
        self.cs61A_sec1 = create_section(
            course=cs61A,
            abbreviation="COMPSCI",
            course_number="61A",
            kind="dis",
            start_time=time_block(9, 59, 59),
            end_time=time_block(11, 29, 59),
            days="135",
            is_primary=False,
            ccn='20002'
        )

        # 18:30 - 20:00, TTH
        self.cs61B_lec1 = create_section(
            course=cs61B,
            abbreviation="COMPSCI",
            course_number="61B",
            kind="lec",
            start_time=time_block(18, 29, 17),
            end_time=time_block(20, 10, 29),
            days="24",
            is_primary=True,
            ccn='30001'
        )
        # 10:00 - 11:30, MWF
        self.cs61B_sec1 = create_section(
            course=cs61B,
            abbreviation="COMPSCI",
            course_number="61B",
            kind="dis",
            start_time=time_block(9, 59, 59),
            end_time=time_block(11, 29, 59),
            days="135",
            is_primary=False,
            ccn='30002'
        )

        # 14:00 - 15:30, TTH
        self.cs61C_lec1 = create_section(
            course=cs61C,
            abbreviation="COMPSCI",
            course_number="61C",
            kind="lec",
            start_time=time_block(13, 59, 17),
            end_time=time_block(15, 40, 0),
            days="24",
            is_primary=True,
            ccn='40001'
        )
        # 10:00 - 11:30, MWF
        self.cs61C_sec1 = create_section(
            course=cs61C,
            abbreviation="COMPSCI",
            course_number="61C",
            kind="dis",
            start_time=time_block(9, 59, 59),
            end_time=time_block(11, 29, 59),
            days="135",
            is_primary=False,
            ccn='40002'
        )
        # 11:30 - 13:00, MWF
        self.cs61C_sec2 = create_section(
            course=cs61C,
            abbreviation="COMPSCI",
            course_number="61C",
            kind="dis",
            start_time=time_block(11, 29, 59),
            end_time=time_block(13, 10, 0),
            days="135",
            is_primary=False,
            ccn='40003'
        )
        # 12:00 - 13:00, Sa
        self.cs61C_sec3 = create_section(
            course=cs61C,
            abbreviation="COMPSCI",
            course_number="61C",
            kind="dis",
            start_time=time_block(11, 59, 59),
            end_time=time_block(13, 10, 0),
            days="6",
            is_primary=False,
            ccn='40004'
        )

    def test_all_conflicts(self):
        """
        cs61A lecture
            cs61A section
        cs61B lecture
            cs61B section
        """
        selected_dict = parse_sections_ccns([
            self.cs61A_lec1.ccn,
            self.cs61A_sec1.ccn,

            self.cs61B_lec1.ccn,
            self.cs61B_sec1.ccn
        ])

        # default constraints
        parsed_constraint_bits = DEFAULT_CONSTRAINT_BITS

        csp = get_csp(selected_dict, parsed_constraint_bits)
        sec_time_list = csp.generate_schedules()
        self.check_num_schedules(sec_time_list, 0)

    def test_no_conflicts_one_schedule(self):
        """
        cs10 lecture
            cs10 section
        cs61B lecture
            cs61B section
        """
        selected_dict = parse_sections_ccns([
            self.cs10_lec1.ccn,
            self.cs10_sec1.ccn,

            self.cs61B_lec1.ccn,
            self.cs61B_sec1.ccn
        ])

        # default constraints
        parsed_constraint_bits = DEFAULT_CONSTRAINT_BITS

        csp = get_csp(selected_dict, parsed_constraint_bits)
        sec_time_list = csp.generate_schedules()
        self.check_num_schedules(sec_time_list, 1)

    def test_conflicts_one_schedule(self):
        """
        cs61A lecture
            cs61A section
        cs61C lecture
            cs61C section 1
            cs61C section 2
        """
        selected_dict = parse_sections_ccns([
            self.cs61A_lec1.ccn,
            self.cs61A_sec1.ccn,

            self.cs61C_lec1.ccn,
            self.cs61C_sec1.ccn, self.cs61C_sec2.ccn
        ])

        # default constraints
        parsed_constraint_bits = DEFAULT_CONSTRAINT_BITS

        csp = get_csp(selected_dict, parsed_constraint_bits)
        sec_time_list = csp.generate_schedules()
        self.check_num_schedules(sec_time_list, 1)

    def test_conflicts_multiple_schedule(self):
        """
        cs61A lecture
            cs61A section
        cs61C lecture
            cs61C section 1
            cs61C section 2
            cs61C section 3
        """
        selected_dict = parse_sections_ccns([
            self.cs61A_lec1.ccn,
            self.cs61A_sec1.ccn,

            self.cs61C_lec1.ccn,
            self.cs61C_sec1.ccn, self.cs61C_sec2.ccn, self.cs61C_sec3.ccn
        ])

        # default constraints
        parsed_constraint_bits = DEFAULT_CONSTRAINT_BITS

        csp = get_csp(selected_dict, parsed_constraint_bits)
        sec_time_list = csp.generate_schedules()
        self.check_num_schedules(sec_time_list, 2)
        return

    def test_no_conflicts_multiple_schedule(self):
        """
        cs10 lecture
            cs10 section
        cs61C lecture
            cs61C section 1
            cs61C section 2
            cs61C section 3
        """
        selected_dict = parse_sections_ccns([
            self.cs10_lec1.ccn,
            self.cs10_sec1.ccn,

            self.cs61C_lec1.ccn,
            self.cs61C_sec1.ccn, self.cs61C_sec2.ccn, self.cs61C_sec3.ccn
        ])

        # default constraints
        parsed_constraint_bits = DEFAULT_CONSTRAINT_BITS

        csp = get_csp(selected_dict, parsed_constraint_bits)
        sec_time_list = csp.generate_schedules()
        self.check_num_schedules(sec_time_list, 3)

    def test_no_selection_produces_no_schedules(self):
        selected_dict = parse_sections_ccns([])
        parsed_constraint_bits = DEFAULT_CONSTRAINT_BITS

        csp = get_csp(selected_dict, parsed_constraint_bits)
        sec_time_list = csp.generate_schedules()
        self.assertEqual(len(sec_time_list), 0, "No Selecting any sections should produce no schedules.")


class TestNoData(SchedulerTestWrapper):
    def test_emptyDB_produces_no_schedules(self):
        # some random ccn, doesn't matter since db is empty
        selected_dict = parse_sections_ccns(['00000'])
        parsed_constraint_bits = DEFAULT_CONSTRAINT_BITS

        csp = get_csp(selected_dict, parsed_constraint_bits)
        sec_time_list = csp.generate_schedules()
        self.assertEqual(len(sec_time_list), 0, "No Schedules should be generated from an empty database.")


# TODO add additional tests for more complex constraints
