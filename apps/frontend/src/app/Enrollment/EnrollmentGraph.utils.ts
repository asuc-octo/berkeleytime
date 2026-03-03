export interface SeriesPoint {
  timeDelta: number;
  value: number;
}

export interface CapacityHistoryPoint {
  startTime: string;
  maxEnroll: number | null;
}

const TIME_DELTA_EPSILON = 1e-6;
const MINUTE_MS = 60_000;

const getMinuteStartMs = (isoDate: string): number | null => {
  const timestampMs = new Date(isoDate).getTime();
  if (Number.isNaN(timestampMs)) return null;
  return Math.floor(timestampMs / MINUTE_MS) * MINUTE_MS;
};

export const getCapacityChangeTimeDeltas = (
  history: CapacityHistoryPoint[]
): number[] => {
  if (history.length < 2) return [];

  const firstTimeMs = getMinuteStartMs(history[0].startTime);
  if (firstTimeMs === null) return [];

  const changeDeltas: number[] = [];
  let previousMaxEnroll = history[0].maxEnroll ?? 0;

  for (let index = 1; index < history.length; index += 1) {
    const entry = history[index];
    const currentMaxEnroll = entry.maxEnroll ?? 0;
    const startTimeMs = getMinuteStartMs(entry.startTime);

    if (currentMaxEnroll !== previousMaxEnroll && startTimeMs !== null) {
      changeDeltas.push((startTimeMs - firstTimeMs) / MINUTE_MS);
    }

    previousMaxEnroll = currentMaxEnroll;
  }

  return Array.from(new Set(changeDeltas));
};

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
