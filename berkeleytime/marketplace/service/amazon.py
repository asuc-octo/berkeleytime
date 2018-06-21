"""Amazon Service."""
from amazonproduct import API
from amazonproduct.errors import InvalidParameterValue, TooManyRequests, AWSError # noqa
import django.utils.simplejson as json
from collections import namedtuple
import lxml

from marketplace.service.exceptions import AmazonTextbookDataNotFound
from marketplace.service.exceptions import AmazonInvalidDataFormat
from marketplace.service.exceptions import AmazonThrottleException
from marketplace.service.exceptions import AmazonItemNotAccessible

AmazonTextbook = namedtuple('AmazonTextbook', ['title', 'author', 'price', 'affiliate_url', 'image_url', 'image_height', 'image_width']) # noqa


class ObjectJSONEncoder(json.JSONEncoder):
    """A specialized JSON encoder that can handle simple lxml objectify types.

    https://stackoverflow.com/questions/471946/how-to-convert-xml-to-json-in-python

    >>> from lxml import objectify
    >>> obj = objectify.fromstring("<Book><price>1.50</price><author>W. Shakespeare</author></Book>") # noqa
    >>> objectJSONEncoder().encode(obj)
    '{"price": 1.5, "author": "W. Shakespeare"}'
    """

    def default(self, o):
        """Default implementation."""
        if isinstance(o, lxml.objectify.IntElement):
            return int(o)
        if isinstance(
            o,
            lxml.objectify.NumberElement
        ) or isinstance(o, lxml.objectify.FloatElement):
            return float(o)
        if isinstance(o, lxml.objectify.ObjectifiedDataElement):
            return unicode(o)
        if hasattr(o, '__dict__'):
            # For objects with a __dict__, return the encoding of the __dict__
            return o.__dict__
        return super(json.JSONEncoder, self).default(o)


class AmazonService(object):
    """Logic for calling amazon."""

    def get_json_info(self, amazon_key, amazon_secret, tag, isbn):
        """Get an info about a book from amazon.

        :param amazon_key: str The aws access key id. This and the secret must
            be associated with our amazon account which is registered with the
            affiliate program.
        :param amazon_secret: str The aws secret key
        :param tag: str The amazon associate tag (from the affiliate dashboard)
        :param isbn: str ISBN of the book to retrive affiliate link for. This
            may be an ISBN 10 or an ISBN 13. If the ISBN is invalid, we'll
            return None.
        :return: A string affiliate url if applicable, else None.
        """
        api = API(
            access_key_id=amazon_key,
            secret_access_key=amazon_secret,
            associate_tag=tag,
            locale='us',
        )
        try:
            response = api.item_lookup(
                isbn,
                ResponseGroup='Large,OfferFull',
                SearchIndex='All',
                IdType='ISBN',
            )
        except InvalidParameterValue:
            # If the ISBN is invalid (i.e. a reader, copy central, or otherwise
            # nonstandard ISBN) the amazon api will return an invalid param
            # error
            raise AmazonTextbookDataNotFound(
                'Data not found on amazon for ISBN {}'.format(isbn)
            )
        except TooManyRequests as e:
            raise AmazonThrottleException(e.message)
        except AWSError as e:
            if e.code == 'AWS.ECommerceService.ItemNotAccessible':
                raise AmazonItemNotAccessible(e.message)
            else:
                raise

        json_response = json.loads(ObjectJSONEncoder().encode(response))
        return json_response

    def get_textbook(self, amazon_key, amazon_secret, tag, isbn):
        """Get textbook data.

        See get_json_info.
        """
        json_response = self.get_json_info(
            amazon_key=amazon_key,
            amazon_secret=amazon_secret,
            tag=tag,
            isbn=isbn,
        )
        try:
            item = json_response['Items']['Item']
            url, height, width = self._parse_image(item, isbn)
            return AmazonTextbook(
                title=item['ItemAttributes']['Title'], # noqa
                author=self._parse_author(item), # noqa
                price=self._parse_price(item),
                affiliate_url=item['DetailPageURL'],
                image_url=url,
                image_height=height,
                image_width=width,
            )
        except KeyError as e:
            raise AmazonInvalidDataFormat('Unable to parse amazon data. Error: {}, data: {}'.format(e.message, json_response)) # noqa

    def _parse_author(self, item_json):
        try:
            return item_json['ItemAttributes']['Author']
        except KeyError:
            try:
                return item_json['ItemAttributes']['Creator']
            except KeyError:
                try:
                    return item_json['ItemAttributes']['Publisher']
                except KeyError:
                    return ''

    def _parse_price(self, item_json):
        """Given json for an item, get a price."""
        try:
            cents = item_json['OfferSummary']['LowestUsedPrice']['Amount'] # noqa
        except KeyError:
            try:
                cents = item_json['OfferSummary']['LowestNewPrice']['Amount'] # noqa
            except KeyError:
                return None
        return float(cents) / 100

    def _parse_image(self, item_json, isbn):
        """Given json for an item, return image url, image height, image width.""" # noqa
        try:
            try:
                image = item_json['MediumImage']
            except KeyError:
                print '==============> WARNING: No image found in amazon json response for ISBN {}'.format(isbn) # noqa
                return None, None, None
            return image['URL'], int(image['Height']), int(image['Width'])
        except ValueError as e:
            raise AmazonInvalidDataFormat('Unable to convert amazon data: {}'.format(e.message)) # noqa
        except KeyError as e:
            raise AmazonInvalidDataFormat('Unable to parse amazon data: '.format(e.message)) # noqa


amazon_service = AmazonService()
