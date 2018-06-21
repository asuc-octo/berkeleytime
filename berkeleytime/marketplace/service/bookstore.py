"""Bookstore service."""
from marketplace.service.resource.bookstore.term import bookstore_terms_resource # noqa
from marketplace.service.resource.bookstore.department import bookstore_departments_resource # noqa
from marketplace.service.resource.bookstore.course import bookstore_courses_resource # noqa
from marketplace.service.resource.bookstore.textbook import bookstore_textbooks_resource # noqa
from marketplace.service.exceptions import BookstoreTermNotFoundException
from marketplace.lib.utils import semester_year_to_term_key


class BookstoreService(object):
    """Logic for calling the cal student bookstore."""

    def fetch_term(self, semester, year):
        """Fetch term."""
        bookstore_terms = bookstore_terms_resource.get()
        term_key = semester_year_to_term_key(semester, year)
        terms = [
            term for term in bookstore_terms if term_key == term.term_name
        ]
        if not terms:
            raise BookstoreTermNotFoundException(
                'Term {} not found in cal student bookstore.'.format(term_key)
            )
        return terms[0]

    def fetch_departments(self, term):
        """Fetch departments."""
        depts = bookstore_departments_resource.get(term=term)
        return depts

    def fetch_courses(self, term, department):
        """Fetch courses."""
        courses = bookstore_courses_resource.get(
            term=term, department=department
        )
        return courses

    def fetch_textbooks(self, bookstore_offerings):
        """Fetch textbooks."""
        books = bookstore_textbooks_resource.get(
            bookstore_offerings=bookstore_offerings
        )
        return books


bookstore_service = BookstoreService()
