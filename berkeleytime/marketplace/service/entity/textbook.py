"""Textbook Entity via Schematics."""
from schematics.models import Model
from schematics.types import IntType
from schematics.types import StringType
from schematics.types import DecimalType
from schematics.types import BooleanType

from math import floor


class Textbook(Model):
    """Textbook Entity."""

    id = IntType()  # not set prior to DB entry

    title = StringType(required=True)
    author = StringType()
    edition = StringType()
    isbn = StringType(required=True)
    amazon_price = DecimalType(min_value=0.00)
    bookstore_price = DecimalType(min_value=0.00)
    is_required = BooleanType(required=True)
    amazon_affiliate_url = StringType()
    amazon_image_url = StringType()
    amazon_image_height = IntType()
    amazon_image_width = IntType()

    @property
    def price_difference(self):
        """Return how much cheaper the book is on amazon (vs bookstore).

        None if we don't have price data for amazon or bookstore.
        None if the textbook is cheaper in the bookstore.
        """
        if not self.bookstore_price or not self.amazon_price:
            return None
        diff = self.bookstore_price - self.amazon_price
        if diff < 0:
            return None
        return int(floor(diff))

    @property
    def recommended_cta_text(self):
        """Display text for course page if this book recommended."""
        if self.price_difference:
            return 'SAVE ${}'.format(self.price_difference)
        return 'VIEW'
