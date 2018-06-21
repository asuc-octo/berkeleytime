"""Textbook Store."""
from marketplace import models
from marketplace.service.entity.textbook import Textbook


class TextbookStore(object):
    """Database interface for Textbook."""

    def update_or_create(self, textbook):
        """Update or create a single textbook entity by ISBN.

        :param <entity.Textbook> textbook:
        """
        entry, created = models.Textbook.objects.get_or_create(
            isbn=textbook.isbn,
            defaults=textbook.flatten(),
        )

        if not created:
            for key, value in textbook.flatten().items():
                setattr(entry, key, value)
            entry.save()

        return Textbook(entry.__dict__, strict=False)

textbook_store = TextbookStore()
