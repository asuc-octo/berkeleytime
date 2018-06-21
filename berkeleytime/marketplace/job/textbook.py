"""Job for fetching textbooks from the cal student bookstore."""
from catalog.service.section import section_service
from marketplace.service.textbook import textbook_service
from marketplace.service.bookstore import bookstore_service
from mondaine.lib.utils import department_to_abbreviation


class TextbookJob(object):
    """Potentially async job for fetching textbook data."""

    def update(self, semester, year, abbreviation, start):
        """Update textbook data for the given params."""
        if abbreviation:
            abbreviations = [abbreviation]
        else:
            abbreviations = section_service.find_abbreviations(
                semester=semester, year=year
            )

        print "Fetching term for {} {} from bookstore".format(semester, year)
        term = bookstore_service.fetch_term(semester=semester, year=year)
        print "Fetched term from bookstore: {}".format(term)
        departments = bookstore_service.fetch_departments(term=term)
        print "Fetched {} departments from bookstore".format(len(departments))
        abbreviation_to_department = dict(
            (
                department_to_abbreviation(department.department_name),
                department
            ) for department in departments
        )
        for abbreviation in abbreviations[start:]:
            print "\nUpdating textbooks for {} {}: {}".format(semester, year, abbreviation) # noqa
            # department = filter(lambda a: a == abbreviation, abbreviations)
            department = abbreviation_to_department.get(abbreviation)
            if department is None:
                print "========> Warning: Abbreviation {} was not in bookstore departments".format(abbreviation) # noqa
                continue
            sis_section_id_to_textbooks = textbook_service.fetch_textbooks(
                department=department,
                term=term,
                semester=semester,
                year=year,
            )
            print sis_section_id_to_textbooks
            for sis_section_id, textbooks in sis_section_id_to_textbooks.iteritems(): # noqa
                textbook_ids = [
                    textbook_service.update_or_create(textbook).id
                    for textbook in textbooks
                ]
                section_service.set_textbooks(
                    sis_section_id=sis_section_id,
                    semester=semester,
                    year=year,
                    textbook_ids=textbook_ids
                )

    def _department_filter_func(self, abbreviation):
        def f(department):
            return department_to_abbreviation(
                department.department_name
            ) == abbreviation
        return f

textbook_job = TextbookJob()
