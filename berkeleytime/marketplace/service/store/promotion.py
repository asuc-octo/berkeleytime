"""Store layer for promotions."""
from marketplace.service.store.amazon_promotions import Cohort
from marketplace.service.store.amazon_promotions import cohort_to_promotions
from marketplace.service.entity.promotion import Promotion


class PromotionStore():
    """Store layer for promotional purchases."""

    def find(self, cohort=Cohort.UNCATEGORIZED):
        """Return all active promotions sorted by priority."""
        promotions = cohort_to_promotions[cohort]
        return [Promotion(p, strict=False) for p in promotions]

promotion_store = PromotionStore()
