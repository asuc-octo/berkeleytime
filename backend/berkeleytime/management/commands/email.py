"""Email jobs based on preferences

Send emails based on occasions from database.
BerkeleytimeUser model has boolean fields to determine if emails are desired.
"""
from django.core.management.base import BaseCommand
from django.core.mail.message import EmailMultiAlternatives
from django.core.mail import get_connection
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from berkeleytime.settings import DEFAULT_FROM_EMAIL
from user.models import BerkeleytimeUser
import os

class Command(BaseCommand):
    """python manage.py email [--subject] [--template] [path-to-template] [--occasion]."""

    def add_arguments(self, parser):
        parser.add_argument(
            '--subject',
            action='store',
            help="Subject of email.",
        )
        parser.add_argument(
            '--template',
            action='store',
            help="Path to template email.",
        )
        parser.add_argument(
            '--occasion',
            action='store',
            help="Type of email update (e.g. email_class_update).",
        )

    def send_mass_html_mail(self, datatuple, fail_silently=False, connection=None):
        connection = connection or get_connection(
            fail_silently=fail_silently,
        )
        messages = [
            EmailMultiAlternatives(subject=subject, body=message, to=(recipient,),
                                alternatives=[(html_message, 'text/html')],
                                connection=connection)
            for subject, message, html_message, recipient in datatuple
        ]
        return connection.send_messages(messages)

    def handle(self, *args, **options):
        if 'subject' not in options or 'template' not in options or 'occasion' not in options:
            print('Please enter all required parameters.')
            return
        subject, template, occasion = options['subject'], options['template'], options['occasion']

        bt_users = BerkeleytimeUser.objects.filter(**{ occasion: True }).select_related('user')
        html_message = render_to_string(template)
        plain_message = strip_tags(html_message)

        email_datatuple = [(subject, plain_message, html_message, bt_user.user.email) for bt_user in bt_users]

        self.send_mass_html_mail(email_datatuple)