"""Enrollment Mapper."""
import datetime
import sys

from berkeleytime.settings import finals_mapper
from enrollment.models import Enrollment

class EnrollmentMapper:
    """Map SIS Class API response data to a dict."""

    def map(self, data, extras={}):
        try:
            enrollment_data = data['enrollmentStatus']

            midnight = datetime.datetime.combine(
                datetime.datetime.now().date(),
                datetime.time(0)
            )
            enrollment_dict = {
                'enrolled_max': enrollment_data['maxEnroll'],
                'enrolled': enrollment_data['enrolledCount'],
                'waitlisted': enrollment_data['waitlistedCount'],
                'waitlisted_max': enrollment_data['maxWaitlist'],
                'date_created': midnight,
            }
            enrollment_dict.update(extras)

            return enrollment_dict
        except Exception as e:
            print({
                'message': 'Error while mapping data to Enrollment object',
                'data': data
            }, e, file=sys.stderr)
            return {}

enrollment_mapper = EnrollmentMapper()
