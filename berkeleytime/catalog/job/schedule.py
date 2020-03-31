"""Schedule Job."""
import logging

from catalog import models
from catalog.service.schedule import schedule_service
from catalog.service.course import course_service
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.playlist import playlist_service
from berkeleytime.utils.common import AtomicInteger, BColors

from multiprocessing.pool import ThreadPool, cpu_count
import time

logger = logging.getLogger(__name__)
NUM_THREADS = min(2 * cpu_count(), 16)

class ScheduleJob(object):
    """Potentially asynchronous jobs for updating the schedule."""

    def update(
        self,
        semester,
        year,
        abbreviation=None,
        course_number=None
    ):
        """Update all sections for a particular course or all applicable courses.

        :param semester: str The semester to update for (fall, spring, summer)
        :param year: str The year to update for (e.g. '2017')
        :param abbreviation: str Course appreviation, e.g. COMPSCI. If
            abbreviation and course_number are both omitted, all courses will =
            have their sections updated.
        :param course_number: str Course number, e.g. 61A
        """
        logger.info({
            'message': 'Executing schedule job.', # noqa
            'semester': semester,
            'year': year,
            'abbreviation': abbreviation,
            'course_number': course_number,
        })
        kwargs = {}
        if abbreviation:
            kwargs['abbreviation'] = abbreviation
        if course_number:
            kwargs['course_number'] = course_number
        if kwargs:
            # TODO (Yuxin) Ew gross this is an abstraction leak
            course_ids = models.Course.objects.filter(**kwargs).values_list('id', flat=True)  # noqa
        else:
            course_ids = models.Course.objects.all().values_list('id', flat=True)  # noqa

        i = AtomicInteger()

        def update_wrapper(course_id):
            i.inc()
            self._update(
                course_id=course_id,
                semester=semester,
                year=year,
            )

        print BColors.OKGREEN + 'Starting job with {} workers.'.format(NUM_THREADS) + BColors.ENDC
        p = ThreadPool(NUM_THREADS)
        result = p.map_async(update_wrapper, course_ids)

        while not result.ready():
            print BColors.OKGREEN + 'Updating course {} of {}'.format(i.value(), len(course_ids)) + BColors.ENDC
            time.sleep(5)

        # TODO (Yuxin) No need to update all semesters, only the updated one
        if semester != 'summer':
            playlist_service.update(category=PlaylistCategory.semester)

        logger.info({
            'message': 'Invalidating course enrollment cache'
        })
        # Part of the schedule update process is to mark the courses as having
        # relevant enrollment data (has_enrollment=True) so that we can show
        # them in the dropdown on the enrollment page. Now that we've updated,
        # we have to invalidate the cache since we might have stale data. This
        # can especially happen if the course job runs after the schedule job,
        # since the course job resets all courses to has_enrollment=False.
        course_service.invalidate_courses_with_enrollment_cache()

    def _update(self, course_id, semester, year):
        """Attempt to update course_id, but always catch exceptions."""
        try:
            schedule_service.update(
                course_id=course_id,
                semester=semester,
                year=year,
                should_record_enrollment=(semester != 'summer')
            )
        except Exception as e:
            logger.error({
                'message': 'Failed to update course',
                'course_id': int(course_id),
                'exception': str(e)
            })

schedule_job = ScheduleJob()
