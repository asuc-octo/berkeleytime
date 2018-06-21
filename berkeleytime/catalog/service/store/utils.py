"""Utility functions for Store."""
import logging

from django.db import models

logger = logging.getLogger(__name__)


def set_field(entry, field, value):
    """Take a django.db.models.Models and sets entry.field to value, but does not save."""  # noqa
    if not isinstance(entry, models.Model):
        raise ValueError({
            'message': 'Argument must be type of models.Model',
            'entry': entry,
            'type': type(entry),
        })

    previous_value = getattr(entry, field)
    if previous_value == value:
        return

    # TODO (Yuxin) Commented out due to Heroku log limit
    # logger.info({
    #     'message': '%s field updated' % type(entry).__name__,
    #     'entry_id': entry.id,
    #     'field': str(field),
    #     'prev_value': previous_value,
    #     'next_value': value,
    # })

    setattr(entry, field, value)
