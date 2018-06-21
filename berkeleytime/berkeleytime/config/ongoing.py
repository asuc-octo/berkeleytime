"""This file instantiates the currently in session semester and year
as ONGOING_SEMESTER and ONGOING_YEAR, as differentiated from
CURRENT_SEMESTER and CURRENT_YEAR, which represent the most current
semester that we have catalog data for.

This is to change the campus page"""

# to change the ongoing semester (used to display sections in campus), change the location of the import below
from semesters import spring2018 as currently_in_session

ONGOING_SEMESTER = currently_in_session.CURRENT_SEMESTER
ONGOING_YEAR = currently_in_session.CURRENT_YEAR
