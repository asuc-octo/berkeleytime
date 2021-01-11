"""Email jobs based on preferences 

Send emails based on occasions from database. 
BerkeleytimeUser model has boolean fields to determine if emails are desired. 
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mass_mail

from user.models import BerkeleytimeUser


class Command(BaseCommand):
    """python manage.py email [--template] [path-to-template] [--occasion]."""

    def add_arguments(self, parser):
        parser.add_argument(
            '--template',
            action='store',
            default=,
            help="Path to template email",
        )
        parser.add_argument(
            '--occasion',
            action='store',
            default=,
            help="Type of email update (e.g. email_class_update)",
        )

    
    def handle(self, *args, **options):
        template, occasion = options['template'], options['occasion']
        occasion_attribute = getattr(BerkeleytimeUser, occasion) 
