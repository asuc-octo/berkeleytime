"""Enumeration of Amazon Promotions."""
from berkeleytime.settings import STATIC_URL


class Cohort(object):
    """Cohorts we may want to advertise to."""

    EECS = 'eecs'
    BUSINESS = 'business'
    UNCATEGORIZED = 'uncategorized'


# TODO (Yuxin) Replace this with an actual SQL table
class Field(object):
    """Just so we don't mis-spell things in the interim."""

    TITLE = 'title'
    DESCRIPTION = 'description'
    IMAGE_URL = 'image_url'
    TRACKING_PIXEL_URL = 'tracking_pixel_url'
    URL = 'url'


class Promotion:
    """Enumeration of all promotions."""

    PRIME_STUDENT = {
        Field.TITLE: 'Free Prime for 6 Months',
        Field.DESCRIPTION: 'Join Prime Student and get 2-day shipping for 6 months free',  # noqa
        Field.IMAGE_URL: STATIC_URL + 'css/img/promotions/prime.png',
        Field.TRACKING_PIXEL_URL: 'https://ir-na.amazon-adsystem.com/e/ir?t=berkeleytime-20&l=pf4&o=1',  # noqa
        Field.URL: 'https://www.amazon.com/gp/student/signup/info/?ref_=assoc_tag_ph_1402130811706&_encoding=UTF8&camp=1789&creative=9325&linkCode=pf4&tag=berkeleytime-20&linkId=b6b6f6df3060c7f0da28197c1c81b5b3',  # noqa
    }

    HBO = {
        Field.TITLE: 'Free HBO Trial',
        Field.DESCRIPTION: 'Catch up on shows like Game of Thrones on Amazon',  # noqa
        Field.IMAGE_URL: STATIC_URL + 'css/img/promotions/hbo.png',
        Field.TRACKING_PIXEL_URL: 'https://ir-na.amazon-adsystem.com/e/ir?t=berkeleytime-20&l=pf4&o=1',  # noqa
        Field.URL: 'https://www.amazon.com/gp/video/detail/B06XNZHGH1?ref_=assoc_tag_ph_1500590597427&_encoding=UTF8&camp=1789&creative=9325&linkCode=pf4&tag=berkeleytime-20&linkId=20c37218331ae6050b18cd61e74c882d',  # noqa
    }

    USED_TEXTBOOKS = {
        Field.TITLE: 'Buy/Sell Used Textbooks',
        Field.DESCRIPTION: 'Buy and sell used textbooks on Amazon at up to 90% off',  # noqa
        Field.IMAGE_URL: STATIC_URL + 'css/img/promotions/textbook.png',
        Field.TRACKING_PIXEL_URL: 'https://ir-na.amazon-adsystem.com/e/ir?t=berkeleytime-20&l=pf4&o=1',  # noqa
        Field.URL: 'https://www.amazon.com/New-Used-Textbooks-Books/b/?ie=UTF8&node=465600&ref_=assoc_tag_ph_1404857896899&_encoding=UTF8&camp=1789&creative=9325&linkCode=pf4&tag=berkeleytime-20&linkId=68a6f774d4051cb1c701d9a43f005581',  # noqa
    }

    GROCERY = {
        Field.TITLE: '$25 Off Grocery Delivery',
        Field.DESCRIPTION: 'Skip the Line! Save $25 on your first grocery order over $100',  # noqa
        Field.IMAGE_URL: STATIC_URL + 'css/img/promotions/grocery.png',
        Field.TRACKING_PIXEL_URL: 'https://ir-na.amazon-adsystem.com/e/ir?t=berkeleytime-20&l=pf4&o=1',  # noqa
        Field.URL: 'https://www.amazon.com/b?ie=UTF8&node=10329849011&tag=berkeleytime-20&ref_=assoc_tag_ph_1507065544167&_encoding=UTF8&camp=1789&creative=9325&linkCode=pf4&linkId=ae6439b30fa66e26b7eaf177e5d1fb09' # noqa
    }

    CRACKING_THE_CODING_INTERVIEW = {
        Field.TITLE: 'Ace Your CS Interview!',
        Field.DESCRIPTION: 'Cracking the Coding Interview: 189 Programming Questions/ Solutions',  # noqa
        Field.IMAGE_URL: STATIC_URL + 'css/img/promotions/coding.png',
        Field.TRACKING_PIXEL_URL: 'https://ir-na.amazon-adsystem.com/e/ir?t=berkeleytime-20&l=am2&o=1&a=0984782850',  # noqa
        Field.URL: 'https://www.amazon.com/gp/product/0984782850/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=0984782850&linkCode=as2&tag=berkeleytime-20&linkId=253cd76c4e7a5324bacb17231b4fbc92'  # noqa
    }

cohort_to_promotions = {
    Cohort.UNCATEGORIZED: [
        # Promotion.CRACKING_THE_CODING_INTERVIEW,
        # Promotion.PRIME_STUDENT,
        # Promotion.HBO,
    ]
}
