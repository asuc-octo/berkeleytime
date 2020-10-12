'''Enrollment Mapper.'''

import logging
import datetime

from berkeleytime.settings import finals_mapper
from enrollment.models import Enrollment

logger = logging.getLogger(__name__)

class EnrollmentMapper():
    '''Map SIS Class API response data to an Enrollment object.'''

    def map(self, data, extras={}):
        try:
            enrollment_data = data['enrollmentStatus']

            midnight = datetime.datetime.combine(
                datetime.datetime.now().date(),
                datetime.time(0)
            )
            kwargs = {
                'enrolled_max': enrollment_data['maxEnroll'],
                'enrolled': enrollment_data['enrolledCount'],
                'waitlisted': enrollment_data['waitlistedCount'],
                'waitlisted_max': enrollment_data['maxWaitlist'],
                'date_created': midnight,
            }
            kwargs.update(extras)

            return Enrollment(**kwargs)
        except:
            logger.exception({
                'message': 'Error while mapping data to Enrollment object',
                'data': data
            })
            raise

enrollment_mapper = EnrollmentMapper()
