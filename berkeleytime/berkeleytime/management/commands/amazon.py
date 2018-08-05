"""Management command for amazon data."""
from django.core.management.base import BaseCommand
from optparse import make_option
from django.utils import simplejson as json
from django.conf import settings

from marketplace.service.amazon import amazon_service

# This import is a hack since with Django 1.6 there's an odd circular import
# error ('cannot import name actions') when django tries to import these modules
# like four levels down. This error only happens when running management
# commands. When we upgrade to Django 1.7+, we might be able to remove this.
# See https://stackoverflow.com/questions/24186814/importerror-cannot-import-name-actions
from django.contrib.admin import ModelAdmin, actions # noqa


class Command(BaseCommand):
    """Prints json from amazon about a given textbook isbn.

    python manage.py amazon.
    """

    option_list = BaseCommand.option_list + (
        make_option(
            '--isbn',
            action='store',
            dest='isbn',
            help='The ISBN to query (may be either ISBN10, or ISBN13)',
        ),
        make_option(
            '--amazon_key',
            action='store',
            dest='amazon_key',
            help='Amazon access key ID (must be enrolled in affiliate program)', # noqa
        ),
        make_option(
            '--amazon_secret',
            action='store',
            dest='amazon_secret',
            help='Amazon secret',
        )
    )

    def handle(self, *args, **options):
        """Main handler."""
        if not settings.AMAZON_AFFILIATE_TAG:
            print {
                'message': 'Amazon affiliate tag not set, please setup Amazon affiliate account before running this script',  # noqa
                'amazon_affiliate_tag': settings.AMAZON_AFFILIATE_TAG,
            }
            return

        if args[0] == 'json':
            data = amazon_service.get_json_info(
                amazon_key=options['amazon_key'],
                amazon_secret=options['amazon_secret'],
                tag=settings.AMAZON_AFFILIATE_TAG,
                isbn=options['isbn'],
            )
            print json.dumps(data)
        elif args[0] == 'textbook':
            get_textbook = amazon_service.get_textbook(
                amazon_key=options['amazon_key'],
                amazon_secret=options['amazon_secret'],
                tag=settings.AMAZON_AFFILIATE_TAG,
                isbn=options['isbn'],
            )
            print get_textbook
        else:
            raise Exception('Must specify: json OR textbook')
