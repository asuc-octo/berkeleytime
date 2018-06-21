# """Functions for defining filters based off of logistical/course info."""
# from mondaine.define.utils import define_course_list
# from mondaine.entity.definition import ConstraintDefinition
# from mondaine.lib import formulas
# from mondaine import config
# from catalog.models import Section


# def define_units():
#     """Define playists for classes with X units."""
#     for units in [0.5, 1, 2, 3, 4, 5]:
#         define_course_list(
#             category="units",
#             playlist_name="%s Units" % units if units != 1 else "1 Unit",
#             definition=ConstraintDefinition(
#                 constraints=[formulas.exactly_n_units(n=units)]
#             )
#         )


# def define_course_levels():
#     """Define playlists for Course Levels (ranges of course numbers).

#     Based on http://guide.berkeley.edu/archive/2013-14/coursenumberguide/
#     """
#     levels = [
#         ("Lower Division", (1, 100)),
#         ("Upper Division", (100, 200)),
#         ("Graduate", (200, 300)),
#         ("Professional", (300, 500)),
#     ]
#     for level_name, level_range in levels:
#         define_course_list(
#             category="level",
#             playlist_name=level_name,
#             definition=ConstraintDefinition(
#                 constraints=[formulas.course_integer_in(range(*level_range))]  # noqa
#             )
#         )


# def define_course_study_types():
#     """Define playlists for special course types (seminars etc)."""
#     levels = [
#         ("Freshmen/Sophomore Seminars", [24, 39, 84]),
#         ("Directed Group Study", [98, 198]),
#         ("Supervised Independent Study", [99, 199]),
#         ("Field Study", [197]),
#     ]
#     for level_name, level_list in levels:
#         define_course_list(
#             category="level",
#             playlist_name=level_name,
#             definition=ConstraintDefinition(
#                 constraints=[formulas.course_integer_in(level_list)]  # noqa
#             )
#         )


# def define_semesters():
#     """Define playlists for all semesters Berkeleytime has been active for."""
#     semesters = config.get("semesters")
#     for display_name in semesters:
#         semester, year = display_name.split()
#         courses = Section.objects.filter(
#             semester=semester.lower(),
#             year=year,
#             disabled=False
#         ).distinct("course").values_list("abbreviation", "course_number")
#         # Generate "<abbreviation> <course_number>" for each course offered
#         courses = ["%s %s" % (abbreviation, course_number) for abbreviation, course_number in courses]  # noqa
#         define_course_list(
#             category="semester",
#             playlist_name=display_name,
#             definition=ConstraintDefinition(
#                 constraints=[formulas.course_in(courses=set(courses))]
#             )
#         )
