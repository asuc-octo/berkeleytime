"""Grade Store."""
from catalog import models
from catalog.service.store.course import course_store
from data.service.entity.grade import Grade


class GradeStore(object):
    """Postgres interface for Grade."""

    def update_or_create(self, grade, failed_grades):
        """Update/Create a single entity.Grade."""
        try:
            course = models.Course.objects.get(
                abbreviation=grade.abbreviation,
                course_number=grade.course_number,
            )
        except models.Course.DoesNotExist:
            failed_grades.append((grade.abbreviation, grade.course_number))
            return

        entry, created = models.Grade.objects.get_or_create(
            course_id=course.id,
            semester=grade.semester,
            year=grade.year,
            section_number=grade.section_number,
            defaults=grade.flatten(),
        )

        if not created:
            for key, value in grade.flatten().items():
                setattr(entry, key, value)
            entry.save()

        # In order to optimize read-only queries, we store grade summary
        # fields in the catalog_course table. To obfuscate the
        # optimization we make sure to tell everyone to refresh their fields.
        #
        # We can use something fancy like signals here, but this is much more
        # readable and equally not thread-safe.
        course_store._update_derived_grade_fields(
            course_id=entry.course_id,
        )

        return Grade(entry.__dict__, strict=False)

grade_store = GradeStore()
