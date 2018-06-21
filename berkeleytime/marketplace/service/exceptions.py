"""Exceptions for marketplace."""


class AmazonServiceException(Exception):
    """Base class for amazon service exceptions."""

    pass


class AmazonTextbookDataNotFound(AmazonServiceException):
    """Indicates data was not found on Amazon for a given ISBN."""

    pass


class AmazonThrottleException(AmazonServiceException):
    """We were throttled by amazon. Make requests more slowly."""

    pass


class AmazonInvalidDataFormat(AmazonServiceException):
    """Indicates data from amazon was not in the format we expected."""

    pass


class AmazonItemNotAccessible(AmazonServiceException):
    """The requested item is not accessible in the Product Advertising api.

    This can happen for certain types of proudcts that are on amazon but aren't
    available for affiliate links, like Mastering A&P and others.
    """

    pass


class BookstoreServiceException(Exception):
    """Base class for bookstore service exceptions."""

    pass


class BookstoreResourceException(BookstoreServiceException):
    """Base class for exceptions relating to the cal student bookstore web pages.""" # noqa

    def __init__(self, message, url):
        """Init."""
        super(BookstoreResourceException, self).__init__(message)
        self.url = url

    def __str__(self):
        """String representation."""
        return '{} url: {}'.format(self.message, self.url)


class BookstoreTermNotFoundException(BookstoreServiceException):
    """Indicates that a given term was not found in the bookstore."""

    pass


class BookstoreURLTooLongException(BookstoreResourceException):
    """Indicates that we tried to request too-long url from bookstore."""

    pass


class BookstorePriceInvalidException(BookstoreServiceException):
    """Indicates that we could not parse a price from the bookstore."""

    pass


class BookstorePageException(Exception):
    """Indicates that the bookstore showed an error, which we should not run into.""" # noqa

    pass


class TextbookServiceException(Exception):
    """Base class for textbook service errors."""

    pass


class TextbookAbbreviationNormalizationException(TextbookServiceException):
    """Indicates that we could not normalize an abbreviation."""

    pass


class TextbookJobResolutionException(TextbookServiceException):
    """Indicates that we could not resolve a textbook in the textbook job."""

    pass
