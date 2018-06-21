"""Grade management command."""
from django.core.management.base import BaseCommand
from data.service.grade import grade_service


class Command(BaseCommand):
    """python manage.py grade <semester?> <year?>."""

    def handle(self, *args, **options):
        """Command handler."""
        if len(args) not in [0, 2]:
            raise ValueError({
                'message': 'Must pass either no arguments or semester/year',
            })

        semester, year = (args[0], args[1]) if len(args) == 2 else (None, None)
        grade_service.update(semester=semester, year=year)
