"""Schedule management command."""

# This import is a hack since with Django 1.6 there's an odd circular import
# error ('cannot import name actions') when django tries to import these modules
# like four levels down. This error only happens when running management
# commands. When we upgrade to Django 1.7+, we might be able to remove this.
# See https://stackoverflow.com/questions/24186814/importerror-cannot-import-name-actions
from django.contrib.admin import ModelAdmin, actions # noqa

# TODO (noah): remove this after textbooks are implemented fully
from django.core.management.base import BaseCommand
from marketplace.service.textbook import textbook_service
from marketplace.service.entity.textbook import Textbook
from catalog.service.section import section_service


def _add_textbooks(abbreviation, course_number, semester, year, textbooks):
    sections = [
        section for section in
        section_service.find(
            abbreviation=abbreviation, course_number=course_number,
            semester=semester, year=year
        )
        if section.is_primary
    ]
    for section in sections:
        section_service.set_textbooks(
            section_id=section.id,
            textbook_ids=[t.id for t in textbooks]
        )


class Command(BaseCommand):
    """python manage.py schedule."""

    def handle(self, *args, **options):
        """Test script for textbooks."""
        cs61c1 = textbook_service.update_or_create(Textbook({
            'title': 'C PROGRAMMING LANGUAGE (ANSI C)',
            'author': 'KERNIGHAN',
            'edition': '2ND 88',
            'isbn': '9780131103702',
            'amazon_price': 45.48,
            'is_required': True
        }))

        cs61c2 = textbook_service.update_or_create(Textbook({
            'title': 'COMPUTER ORGANIZATION DESIGN ARCHITECTURE',
            'author': 'PATTERSON',
            'edition': '5TH 14',
            'isbn': '9780124077263',
            'amazon_price': 71.16,
            'is_required': True
        }))

        _add_textbooks(
            abbreviation='MATH', course_number='54',
            semester='fall', year=2017,
            textbooks=[cs61c1, cs61c2]
        )
