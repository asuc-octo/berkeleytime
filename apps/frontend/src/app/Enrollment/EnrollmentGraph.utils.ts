export interface SeriesPoint {
  timeDelta: number;
  value: number;
}

const TIME_DELTA_EPSILON = 1e-6;

/**
 * Estimate a value at a given timestamp by linearly interpolating between the
 * nearest known points. Returns null when the target lies outside known bounds.
 */
export const estimateSeriesValueAtTime = (
  points: SeriesPoint[],
  targetTimeDelta: number
): number | null => {
  if (points.length === 0) return null;

  let leftIndex = 0;
  let rightIndex = points.length - 1;

  while (leftIndex <= rightIndex) {
    const middleIndex = Math.floor((leftIndex + rightIndex) / 2);
    const point = points[middleIndex];
    const delta = point.timeDelta - targetTimeDelta;

    if (Math.abs(delta) < TIME_DELTA_EPSILON) {
      return point.value;
    }

    if (delta < 0) {
      leftIndex = middleIndex + 1;
    } else {
      rightIndex = middleIndex - 1;
    }
  }

  const previousPoint = points[rightIndex];
  const nextPoint = points[leftIndex];

  if (!previousPoint || !nextPoint) return null;

  const span = nextPoint.timeDelta - previousPoint.timeDelta;
  if (Math.abs(span) < TIME_DELTA_EPSILON) return previousPoint.value;

  const ratio = (targetTimeDelta - previousPoint.timeDelta) / span;
  return previousPoint.value + (nextPoint.value - previousPoint.value) * ratio;
};
