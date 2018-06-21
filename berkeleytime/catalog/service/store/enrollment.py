"""Enrollment Store."""
import datetime

from catalog import models
from catalog.service.entity.enrollment import Enrollment
from catalog.service.store.course import course_store
from catalog.service.store.section import section_store
from catalog.service.course import course_service


class EnrollmentStore(object):
    """Database interface for Enrollment."""

    def update_or_create(self, section_id, enrollment):
        """Take a section_id, entity.Enrollment and a record in DB."""
        midnight = datetime.datetime.combine(
            datetime.datetime.now().date(),
            datetime.time(0)
        )
        # Hardcoded to midnight so we never have more than one each day
        enrollment.date_created = midnight
        # set section id here? TODO (Yuxin)
        entry, created = models.Enrollment.objects.get_or_create(
            section_id=section_id,
            date_created=midnight,
            defaults=enrollment.flatten(),
        )

        if not created:
            for key, value in enrollment.flatten().items():
                setattr(entry, key, value)
            entry.save()

        # In order to optimize read-only queries, we store enrollment summary
        # fields in catalog_course and catalog_section tables. To obfuscate the
        # optimization we make sure to tell everyone to refresh their fields.
        #
        # We can use something fancy like signals here, but this is much more
        # readable and equally not thread-safe.
        section_store._update_derived_enrollment_fields(
            section_id=section_id
        )
        course_store._update_derived_enrollment_fields(
            course_id=entry.section.course_id,
            semester=entry.section.semester,
            year=entry.section.year,
        )
        course = course_service.get(entry.section.course_id)
        if not course.has_enrollment:
            course.has_enrollment = True
            course_service.update_or_create(course)
        return Enrollment(entry.__dict__, strict=False)

    def get_latest(self, section_id):
        """Return the latest enrollment given a section_id."""
        entry = models.Enrollment.objects.filter(
            section__id=section_id).latest('date_created')

        if not entry:
            return

        return Enrollment(entry.__dict__, strict=False)


enrollment_store = EnrollmentStore()
