import { ICatalogClass } from "@/lib/api";
import { FuzzySearch } from "@repo/common";

import { SortBy } from "./browser";
import { SortOrder, sortClasses } from "./sorting";

const MAX_QUERY_LENGTH = 24;
const HIGH_CONFIDENCE_THRESHOLD = 0.05;
const EPSILON = 1e-6;

// This file is quite complicated, but basically we want to find a balance between fuzzy search and user sort preference
// We achieve this by bucketing fuzzy score into categories of different confidences, then sorting within each bucket

interface SearchAndSortParams {
  classes: readonly ICatalogClass[];
  index: FuzzySearch<unknown>;
  query: string;
  sortBy: SortBy;
  order: SortOrder;
  maxQueryLength?: number;
}

interface Hit {
  item: ICatalogClass;
  score: number;
  refIndex: number;
  order: number;
}

interface BucketedHit extends Hit {
  bucket: number;
}

const quantile = (sorted: readonly number[], percentile: number) => {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];

  const index = Math.floor(percentile * (sorted.length - 1));
  const clampedIndex = Math.min(sorted.length - 1, Math.max(0, index));

  return sorted[clampedIndex];
};

const bucketizeHits = (hits: Hit[]): BucketedHit[] => {
  if (hits.length === 0) return [];

  const sortedByScore = [...hits].sort((a, b) => a.score - b.score);
  const scores = sortedByScore.map((hit) => hit.score);

  const median = quantile(scores, 0.5);
  const highConfidence = median <= HIGH_CONFIDENCE_THRESHOLD;

  const thresholds: number[] = [];

  const maybeAddThreshold = (value: number) => {
    if (Number.isNaN(value)) return;
    if (thresholds.length === 0) {
      thresholds.push(value);
      return;
    }

    const last = thresholds[thresholds.length - 1];
    if (value > last + EPSILON) {
      thresholds.push(value);
    }
  };

  if (scores.length > 0) {
    const firstPercentile = highConfidence ? 0.45 : 0.75;
    const secondPercentile = highConfidence ? 0.8 : 0.95;

    maybeAddThreshold(quantile(scores, firstPercentile));
    maybeAddThreshold(quantile(scores, secondPercentile));
  }

  return hits.map((hit) => {
    const bucketIndex = thresholds.findIndex(
      (threshold) => hit.score <= threshold + EPSILON
    );

    return {
      ...hit,
      bucket: bucketIndex === -1 ? thresholds.length : bucketIndex,
    };
  });
};

export const searchAndSortClasses = ({
  classes,
  index,
  query,
  sortBy,
  order,
  maxQueryLength = MAX_QUERY_LENGTH,
}: SearchAndSortParams): ICatalogClass[] => {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
    return sortClasses(classes, sortBy, order);
  }

  const limitedQuery = trimmedQuery.slice(0, maxQueryLength).toUpperCase();
  const results = index.search(limitedQuery);

  if (results.length === 0) {
    return [];
  }

  const relevanceScores = new Map<ICatalogClass, number>();
  const hits: Hit[] = [];

  results.forEach(({ refIndex, score }, orderIndex) => {
    if (typeof refIndex !== "number") return;

    const item = classes[refIndex];
    if (!item) return;

    const normalizedScore =
      typeof score === "number" ? Math.max(0, Math.min(1, score)) : 1;

    relevanceScores.set(item, normalizedScore);
    hits.push({
      item,
      score: normalizedScore,
      refIndex,
      order: orderIndex,
    });
  });

  if (hits.length === 0) {
    return [];
  }

  const bestHit = hits.reduce<Hit | null>((currentBest, hit) => {
    if (!currentBest) return hit;

    if (hit.score < currentBest.score - EPSILON) return hit;
    if (Math.abs(hit.score - currentBest.score) <= EPSILON) {
      return hit.order < currentBest.order ? hit : currentBest;
    }

    return currentBest;
  }, null);

  const remainingHits = bestHit ? hits.filter((hit) => hit !== bestHit) : hits;

  const bucketedHits = bucketizeHits(remainingHits);
  const buckets = new Map<number, Hit[]>();

  bucketedHits.forEach(({ bucket, ...rest }) => {
    const current = buckets.get(bucket);

    if (current) {
      current.push(rest);
    } else {
      buckets.set(bucket, [rest]);
    }
  });

  const orderedBuckets = [...buckets.keys()].sort((a, b) => a - b);
  const rankedClasses: ICatalogClass[] = [];

  if (bestHit) {
    const sortedBest = sortClasses([bestHit.item], sortBy, order, {
      relevanceScores,
    });

    rankedClasses.push(...sortedBest);
  }

  orderedBuckets.forEach((bucketKey) => {
    const bucketHits = buckets.get(bucketKey);
    if (!bucketHits) return;

    const bucketClasses = bucketHits.map((hit) => hit.item);
    const sortedBucket = sortClasses(bucketClasses, sortBy, order, {
      relevanceScores,
    });

    rankedClasses.push(...sortedBucket);
  });

  return rankedClasses;
};

export const MAX_FUSE_QUERY_LENGTH = MAX_QUERY_LENGTH;
