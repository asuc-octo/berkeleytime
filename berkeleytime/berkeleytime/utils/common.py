"""Common utils for all of Berkeleytime."""
from collections import namedtuple

CourseOffering = namedtuple(
    'CourseOffering',
    ['semester', 'year', 'abbreviation', 'course_number']
)
