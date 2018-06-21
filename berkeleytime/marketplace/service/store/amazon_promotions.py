"""Enumeration of Amazon Promotions."""


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

cohort_to_promotions = {
    Cohort.UNCATEGORIZED: []
}
