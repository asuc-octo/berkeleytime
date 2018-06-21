"""Promotion Service."""
import random

from marketplace.service.store.promotion import promotion_store


class PromotionService(object):
    """Service layer for promotional purchases."""

    def find(self):
        """Return all promotions sorted by priority."""
        promotions = promotion_store.find()

        # TODO (Yuxin) This is a mega-abstraction leak, but return a much
        # larger list of promotions by keeping the order for the first three

        return promotions + [random.choice(promotions) for _ in range(20)]

promotion_service = PromotionService()
