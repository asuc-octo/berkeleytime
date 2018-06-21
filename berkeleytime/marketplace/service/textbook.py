"""Textbook Service."""

from marketplace.service.store.textbook import textbook_store
from marketplace.service.amazon import amazon_service
from marketplace.service.bookstore import bookstore_service
from marketplace.service.entity.textbook import Textbook
from marketplace.service.exceptions import TextbookAbbreviationNormalizationException, TextbookJobResolutionException, AmazonTextbookDataNotFound, AmazonThrottleException, AmazonItemNotAccessible # noqa
from catalog.service.section import section_service
from marketplace.service.resource.bookstore.textbook import BookstoreOffering
from mondaine.lib.utils import department_to_abbreviation

from mondaine.service.level import level_service

from django.conf import settings

import logging
import time

logger = logging.getLogger(__name__)


class TextbookService(object):
    """Application logic for textbook information."""

    NO_TEXTBOOK = 'NO_TEXTBOOK'

    def get(self, id):
        """Retrieve a single textbook."""
        # return textbook_store.get(id)
        raise NotImplementedError()

    def find(self, course_id, semester, year):
        """Retrieve all textbooks sorted by price."""
        raise NotImplementedError()

    def update_or_create(self, textbook):
        """Update/Create enrollment information.

        :param <entity.Textbook> textbook:
        """
        return textbook_store.update_or_create(textbook)

    def fetch_textbooks(self, department, term, semester, year): # noqa
        """Fetch textbook resources from the bookstore.

        :param semester: str The semester to fetch for (spring, fall, summer)
        :param year: str The year to fetch for
        :param course_number: str The course number to fetch for
        :param sis_section_id: str The id of the section to fetch
        :returns: list[entity.textbook.Textbook] Textbooks fetched
        """
        bookstore_courses = bookstore_service.fetch_courses(
            department=department,
            term=term
        )
        print "--> Fetched {} courses for department {} from bookstore".format(len(bookstore_courses), department.department_code) # noqa
        print "Resolving {} total courses against berkeleytime db".format(len(bookstore_courses)) # noqa
        offerings = self._resolve_bookstore_courses(
            bookstore_courses=bookstore_courses,
            term=term,
            semester=semester,
            year=year,
        )
        print "Fetching {} (filtered) total section offerings from bookstore".format(len(offerings)) # noqa
        section_id_to_textbooks = bookstore_service.fetch_textbooks(
            bookstore_offerings=offerings
        )
        # print section_id_to_textbooks
        num_textbooks = reduce(
            lambda sum, key: sum + len(section_id_to_textbooks[key]),
            section_id_to_textbooks.iterkeys(),
            0
        )
        print "Resolving {} total textbooks from bookstore with amazon".format(num_textbooks) # noqa
        cache = {}  # isbn -> Textbook entity
        resolved_section_id_to_textbooks = dict(
            (section_id, self._resolve_textbooks_with_amazon(textbooks, cache))
            for section_id, textbooks in section_id_to_textbooks.iteritems()
        )
        return resolved_section_id_to_textbooks

    def _resolve_bookstore_courses(self, bookstore_courses, term, semester, year): # noqa
        """Resolve the bookstore courses with our DB and return offerings."""
        offerings = []
        for bookstore_course in bookstore_courses:
            try:
                normalized_abbreviation = department_to_abbreviation( # noqa
                    bookstore_course.department.department_name
                )
                if not normalized_abbreviation:
                    raise TextbookAbbreviationNormalizationException(
                        'Abbreviation {} ({}) could not be normalized.'.format(
                            bookstore_course.department.department_code,
                            bookstore_course.department.department_name
                        )
                    )
                normalized_course_number = self._normalized_course_number(
                    bookstore_course.course_code
                )
                sections = section_service.find(
                    abbreviation=normalized_abbreviation,
                    course_number=normalized_course_number,
                    semester=semester,
                    year=year,
                )
                if not sections:
                    print "==============> WARNING: Could not find sections for course: {} {}".format( # noqa
                        normalized_abbreviation, normalized_course_number
                    )
                    continue
                    # raise TextbookJobResolutionException(
                    #     'Could not find sections for course: {} {}'.format(
                    #         normalized_abbreviation, normalized_course_number
                    #     )
                    # )
                # print "-- Found {} applicable sections in berkeleytime db".format(len(sections)) # noqa
                sections = self._exclude_sections(sections)
                # print "-- Filtered down to {} sections we should search bookstore for".format(len(sections)) # noqa
                offerings.extend([
                    BookstoreOffering(
                        term=term,
                        course=bookstore_course,
                        sis_section_id=section.ccn
                    )
                    for section in sections
                ])
            except Exception as e:
                print(e)
                logger.error({
                    'message': 'Failed to fetch textbook from bookstore',
                    'exception': str(e),
                    'course': bookstore_course
                })
                continue
        return offerings

    def _exclude_sections(self, sections):
        """Exclude sections that we shouldn't graph textbook data for."""
        def filter_func(section):
            # TODO(noah): We're passing a section to a func that expects a
            # course-like object here, this is kind of hacky
            return section.is_primary and level_service.is_normal_undergraduate(section) # noqa
        return filter(filter_func, sections)

    def _normalized_course_number(self, course_number):
        return course_number.lstrip('0')

    # TODO(noah): There should be a retry decorator for this
    def _get_textbook_from_amazon(self, key, secret, tag, isbn):
        try:
            return amazon_service.get_textbook(
                amazon_key=key,
                amazon_secret=secret,
                tag=tag,
                isbn=isbn
            )
        except AmazonThrottleException:
            print "========> Warning: amazon request throttled, waiting 2 seconds" # noqa
            time.sleep(2)
            return amazon_service.get_textbook(
                amazon_key=key,
                amazon_secret=secret,
                tag=tag,
                isbn=isbn
            )

    def _resolve_textbooks_with_amazon(self, bookstore_textbooks, cache):
        amazon_textbooks = []
        for textbook in bookstore_textbooks:
            try:
                cached = cache.get(textbook.isbn)
                if cached:
                    resolved_textbook = cached
                    if resolved_textbook == self.NO_TEXTBOOK:
                        print "-- (cached) Textbook '{}' ({}) not found on Amazon".format(textbook.title, textbook.isbn) # noqa
                else:
                    # sleep 1 second so we don't get throttled by amazon
                    time.sleep(1)
                    resolved_textbook = self._get_textbook_from_amazon(
                        key=settings.AWS_AFFILIATE_ACCESS_KEY_ID,
                        secret=settings.AWS_AFFILIATE_SECRET,
                        tag=settings.AMAZON_AFFILIATE_TAG,
                        isbn=textbook.isbn
                    )
                    cache[textbook.isbn] = resolved_textbook
                if resolved_textbook != self.NO_TEXTBOOK:
                    amazon_textbooks.append(resolved_textbook)
                    print "-- {}Resolved textbook '{}' ({}) on Amazon".format('(cached) ' if cached else '', textbook.title, textbook.isbn) # noqa
            except AmazonTextbookDataNotFound:
                print "-- Textbook '{}' ({}) not found on Amazon".format(textbook.title, textbook.isbn) # noqa
                cache[textbook.isbn] = self.NO_TEXTBOOK
                # TODO(noah): this is hacky - we need to keep
                # bookstore_textbooks and amazon_textbooks the same length
                # since we'll zip them later. We should key then by isbn
                # instead
                amazon_textbooks.append(None)
                continue
            except AmazonItemNotAccessible:
                print "-- Textbook '{}' ({}) unavailable on Amazon".format(textbook.title, textbook.isbn) # noqa
                cache[textbook.isbn] = self.NO_TEXTBOOK
                amazon_textbooks.append(None)
                continue
            except Exception as e:
                print(e)
                logger.error({
                    'message': 'Failed to update textbook with amazon',
                    'exception': str(e),
                    'textbook': textbook
                })
                amazon_textbooks.append(None)
                continue

        results = []
        for bookstore_textbook, amazon_textbook in zip(
            bookstore_textbooks, amazon_textbooks
        ):
            data = {
                'title': bookstore_textbook.title,
                'author': bookstore_textbook.author,
                'edition': bookstore_textbook.edition,
                'isbn': bookstore_textbook.isbn,
                'is_required': bookstore_textbook.is_required,
            }
            if amazon_textbook:
                data.update({
                    'title': amazon_textbook.title,
                    'author': amazon_textbook.author,
                    'amazon_price': amazon_textbook.price,
                    'bookstore_price': bookstore_textbook.price,
                    'amazon_affiliate_url': amazon_textbook.affiliate_url,
                    'amazon_image_url': amazon_textbook.image_url,
                    'amazon_image_width': amazon_textbook.image_width,
                    'amazon_image_height': amazon_textbook.image_height,
                })
            results.append(Textbook(data))
        return results


textbook_service = TextbookService()
