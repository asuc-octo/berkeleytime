"""Management command for SIS api command line CLI."""
from django.core.management.base import BaseCommand
from berkeleytime import settings
import requests
from optparse import make_option
from django.utils import simplejson as json


class Command(BaseCommand):
    """python manage.py sis_api_cli."""

    option_list = BaseCommand.option_list + (
        make_option(
            '--sis_id',
            action='store',
            dest='sis_id',
            help='SIS api ID',
        ),
        make_option(
            '--sis_key',
            action='store',
            dest='sis_key',
            help='SIS api key',
        )
    )

    def handle(self, *args, **options):
        """Test script for textbooks."""
        url = args[0]
        headers = {
            'Accept': 'application/json',
            'app_id': options['sis_id'] or settings.SIS_CLASS_APP_ID,
            'app_key': options['sis_key'] or settings.SIS_CLASS_APP_KEY
        }
        response = requests.get(url, headers=headers)
        response = json.dumps(response.json())
        print response
