"""Email jobs based on preferences 

Send emails based on occasions from database. 
BerkeleytimeUser model has boolean fields to determine if emails are desired. 
"""
from django.core.management.base import BaseCommand

from berkeleytime.settings import CURRENT_SEMESTER, CURRENT_YEAR
from user.models import BerkeleytimeUser


class Command(BaseCommand):
    """python manage.py email [--template] [path-to-template] [--occasion]."""

    def add_arguments(self, parser):
        parser.add_argument(
            '--template',
            action='store',
            default=CURRENT_SEMESTER,
            help="Path to template email",
        )
        parser.add_argument(
            '--occasion',
            action='store',
            default=CURRENT_YEAR,
            help="Type of email update (e.g. email_class_update)",
        )