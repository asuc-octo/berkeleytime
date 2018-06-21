"""Schedule Job."""
import logging

from catalog import models
from catalog.service.schedule import schedule_service
from mondaine.service.enumeration.category import PlaylistCategory
from mondaine.service.playlist import playlist_service

logger = logging.getLogger(__name__)


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

        # TODO (*) Fan this out into N asynchronous jobs
        # TODO (Yuxin) Add proper circuit breaker logic
        for index, course_id in enumerate(course_ids):
            print 'Updating course {} of {}'.format(index, len(course_ids))
            self._update(
                course_id=course_id,
                semester=semester,
                year=year,
            )

        # TODO (Yuxin) No need to update all semesters, only the updated one
        if semester != 'summer':
            playlist_service.update(category=PlaylistCategory.semester)

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
