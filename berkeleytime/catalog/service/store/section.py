"""Schedule Service."""
import logging
from django.core.exceptions import MultipleObjectsReturned

from catalog import models
from catalog.service.entity.section import Section
from catalog.service.store import utils
from marketplace.service.entity.textbook import Textbook

logger = logging.getLogger(__name__)


class SectionStore(object):
    """Section interface with Postgres."""

    def find_abbreviations(self, semester, year):
        """Return all existing abbreviations in a given semester/year."""
        return models.Section.objects.filter(
            semester=semester, year=year
        ).order_by('abbreviation').values_list(
            'abbreviation', flat=True
        ).distinct()

    def find(self, semester, year, abbreviation, course_number, section_number=None):  # noqa
        """Given some fields, find all sections that match."""
        kwargs = {
            'semester': semester,
            'year': year
        }
        if abbreviation:
            kwargs['abbreviation'] = abbreviation
        if course_number:
            kwargs['course_number'] = course_number
        if section_number:
            kwargs['section_number'] = section_number
        sections = models.Section.objects.filter(**kwargs)
        return [Section(s.__dict__, strict=False) for s in sections]

    def find_by_course_id(
        self, course_id, semester=None, year=None, is_primary=None
    ):
        """Given a (course_id, semester, year) find all sections that match."""
        sections = models.Section.objects.filter(
            course_id=course_id, disabled=False,
        )

        if year is not None and semester is not None:
            sections = sections.filter(semester=semester, year=year)

        if is_primary is not None:
            sections = sections.filter(is_primary=is_primary)

        # TODO (ASUC) Rank no longer works?
        sections = sections.order_by('rank', 'section_number')

        return [Section(s.__dict__, strict=False) for s in sections]

    def exists(self, semester, year):
        """Return True if sections exist for semester, year."""
        query = models.Section.objects.filter(semester=semester, year=year)
        return bool(query.exists())

    def set_textbooks(self, ccn, semester, year, textbook_ids):
        """Set a series of textbooks for a single course.

        :param str ccn: The section id from SIS of the section to
            set. This is because we use SIS section id as CCN in the db.
        :param str semester: Semester to set for. Necessary since section
            SIS section id is not necessarily unique across semesters/years.
        :param str year: Year to set for. Necessary since section SIS section
            id is not necessarily unique across semesters/years.
        :param list<int> textbook_ids: List of berkeleytime ids of textbooks
            to set.
        """
        # TODO (ASUC) Future versions of Django can utilize set method
        try:
            section = models.Section.objects.get(
                ccn=ccn, semester=semester, year=year
            )
        except MultipleObjectsReturned:
            print "==============> WARNING: Multiple instances of CCN {}, for {} {} in databse, using last updated".format(ccn, semester, year) # noqa
            section = models.Section.objects.filter(
                ccn=ccn, semester=semester, year=year
            ).order_by('-last_updated')[0]
        section.textbooks.clear()
        section.textbooks.add(*textbook_ids)

    def find_textbooks_by_section_id(self, section_id):
        """Retrieve the textbooks for a single section.

        :param int section_id:
        :returns <list<entity.Textbook>>:
        """
        textbooks = models.Section.objects.get(
            id=section_id
        ).textbooks.order_by(
            'is_required', '-amazon_price',
        )
        return [Textbook(t.__dict__, strict=False) for t in textbooks]

    def _exclude_derived_fields(self, section):
        """Map entity.Section to dict and exclude all derived fields."""
        return {
            # k: v for (k, v) in section.flatten().items() if k not in models.Section._derived_enrollment_fields  # noqa
            k: v for (k, v) in section.flatten().items() # noqa
        }

    # This is not threadsafe!
    def update_or_create(self, section):
        """Update or create a entity.Section and return it."""
        logger.info({
            'message': 'Updating/creating section',
            'semester': section.semester,
            'year': section.year,
            'course_id': section.course_id,
            'abbreviation': section.abbreviation,
            'course_number': section.course_number,
        })

        entry, created = models.Section.objects.get_or_create(
            course__id=section.course_id,
            semester=section.semester,
            year=section.year,
            section_number=section.section_number,
            kind=section.kind,
            defaults=self._exclude_derived_fields(section),
        )

        if not created:
            for field, value in self._exclude_derived_fields(section).items():
                utils.set_field(entry, field, value)
            entry.save()

        return Section(entry.__dict__, strict=False)

    def _update_derived_enrollment_fields(self, section_id):
        """Get the latest Enrollment for section, and update derived fields."""
        section = models.Section.objects.get(pk=section_id)
        enrollment = models.Enrollment.objects.filter(section_id=section_id).latest('date_created')  # noqa

        for field in models.Section._derived_enrollment_fields:
            derived_value = getattr(enrollment, field)
            utils.set_field(section, field, derived_value)
        section.save()

        return Section(section.__dict__, strict=False)

section_store = SectionStore()
