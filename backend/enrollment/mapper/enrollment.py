"""Enrollment Mapper."""

import logging
import datetime

from berkeleytime.settings import finals_mapper
from enrollment.models import Enrollment

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

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
        except:
            logger.exception({
                'message': 'Error while mapping data to Enrollment object',
                'data': data
            })
            return {}

enrollment_mapper = EnrollmentMapper()
