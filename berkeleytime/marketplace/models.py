"""Django models for marketplace."""
from django.db import models


class Textbook(models.Model):
    """A textbook offered by the student store."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    title = models.CharField(max_length=500)
    author = models.CharField(null=True, max_length=300)
    edition = models.CharField(null=True, max_length=100)

    # ISBN of the book. Note that we allow no-isbn textbooks and non-standard
    # ISBNs (i.e. of readers in copy central).
    isbn = models.CharField(max_length=30, unique=True, db_index=True) # noqa

    is_required = models.BooleanField()
    amazon_price = models.DecimalField(null=True, max_digits=7, decimal_places=2) # noqa
    bookstore_price = models.DecimalField(null=True, max_digits=7, decimal_places=2) # noqa
    amazon_affiliate_url = models.URLField(null=True, max_length=2000)
    amazon_image_url = models.URLField(null=True, max_length=2000)
    amazon_image_height = models.IntegerField(null=True)
    amazon_image_width = models.IntegerField(null=True)
