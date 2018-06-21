"""Resource for bookstore textbooks."""
import urllib

from django.utils import simplejson as json
import requests
from bs4 import BeautifulSoup
from collections import namedtuple
import itertools
from math import ceil

from marketplace.service.exceptions import BookstoreURLTooLongException, BookstorePriceInvalidException # noqa


def grouper(n, iterable, fillvalue=None):
    """Group an iterable into length-n sub-iterables.

    https://stackoverflow.com/questions/2231663/slicing-a-list-into-a-list-of-sub-lists

    >>> grouper(3, 'ABCDEFG', 'x') --> ABC DEF Gxx
    """
    args = [iter(iterable)] * n
    return itertools.izip_longest(*args)


BookstoreTextbook = namedtuple('BookstoreTextbook', ['title', 'author', 'edition', 'isbn', 'is_required', 'price']) # noqa
BookstoreOffering = namedtuple('BookstoreOffering', ['term', 'course', 'sis_section_id']) # noqa
BookstorePriceOption = namedtuple('BookstorePrice', ['kind', 'price'])


class BookstoreTextbooksResource(object):
    """Interface with cal bookstore."""

    url = 'https://calstudentstore.berkeley.edu/courselisting/index/loadMaterials?courses={}' # noqa

    def get(self, bookstore_offerings): # noqa
        """Fetch a list of textbooks for a given section.

        TODO params
        """
        page_size = 10
        num_offerings = len(bookstore_offerings)
        num_pages = max(num_offerings / page_size, int(ceil(num_offerings / float(page_size)))) # noqa

        section_id_to_textbooks = {}
        for index, group in enumerate(grouper(page_size, bookstore_offerings)):
            print "({}/{}) Requesting {} sections worth of textbook data from bookstore".format(index + 1, num_pages, len(group)) # noqa

            section_id_to_textbooks = dict(section_id_to_textbooks, **self._get_page(group))  # noqa

        return section_id_to_textbooks

    def _get_page(self, bookstore_offerings):
        url = self._build_url(
            offerings=[o for o in bookstore_offerings if o]
        )
        print url
        if len(url) > 2083:
            raise BookstoreURLTooLongException(
                message='We generated a bookstore url that was too long.',
                url=url
            )
        return self._fetch_textbooks(url)

    def _build_url(self, offerings): # noqa
        data = [
            {
                'school': 'UCB',
                'term': offering.term.term_name,
                'dept': offering.course.department.department_code,
                'course': offering.course.course_code,
                'section': offering.sis_section_id
            }
            for offering in offerings
        ]
        return self.url.format(urllib.quote(json.dumps(data)))

    def _fetch_textbooks(self, url):
        html = requests.get(url).text
        bs = BeautifulSoup(html)
        error = bs.find('li', attrs={'class': 'error-msg'})
        if error and 'There was an error with the request' in error.text:
            raise BookstorePageException('Error encountered on bookstore page. Url was {}'.format(url)) # noqa

        products_and_items_html = bs.findAll(True, {'class': ['item-row', 'product-name']})  # noqa
        return self._get_section_id_to_bookstore_textbooks(
            products_and_items_html=products_and_items_html
        )

    def _get_section_id_to_bookstore_textbooks(self, products_and_items_html):
        section_id, section_id_to_bookstore_textbooks = None, {}
        for node in products_and_items_html:
            if 'item-row' in node.attrs['class'] and section_id is not None:
                section_id_to_bookstore_textbooks[section_id].append(self._parse_item(node))  # noqa

            if 'product-name' in node.attrs['class']:
                section_id = self._get_section_id_from_product(node)
                section_id_to_bookstore_textbooks[section_id] = []

        return section_id_to_bookstore_textbooks

    def _get_section_id_from_product(self, item):
        h2 = item.find('h2').text.strip()
        potential_section_id = h2.split('-')[-1].strip()

        # TODO (Noah) Fix this
        assert int(potential_section_id)

        return potential_section_id

    def _parse_item(self, item):
        name = item.find(attrs={'class': 'book-name'}).text
        is_required = False
        if 'Required' in name:
            is_required = True
            name = name.replace('(Required)', '').strip()

        attributes = item.find(attrs={'class': 'book-attr'}).findAll('li')
        for text in [attribute.text for attribute in attributes]:
            key, val = [s.strip() for s in text.split(':')[:2]]
            if 'Author' in key:
                author = val
            if 'Edition' in key:
                edition = val
            if 'ISBN' in key:
                isbn = val

        price = self._parse_price(item)

        return BookstoreTextbook(
            title=name,
            author=author,
            edition=edition,
            isbn=isbn,
            is_required=is_required,
            price=price
        )

    def _parse_price(self, item):
        select = item.find(
            'select',
            attrs={'class': 'form-control'}
        )
        if not select:
            return None

        price_options = [
            self._parse_price_option(option) for option in
            select.findAll('option')
        ]
        new_options = filter(
            lambda opt: 'Rental' not in opt.kind and 'New' in opt.kind,
            price_options
        )
        new_option = new_options[0] if new_options else None
        if not new_option:
            return None

        try:
            price = float(new_option.price)
        except ValueError:
            raise BookstorePriceInvalidException(
                'Price option {} could not be parsed as a decimal.'.format(
                    new_option
                )
            )
        return price

    def _parse_price_option(self, option):
        kind, price = option.text.split(':')
        return BookstorePriceOption(
            kind=kind.strip(),
            price=price.replace('$', '').strip()
        )


bookstore_textbooks_resource = BookstoreTextbooksResource()
