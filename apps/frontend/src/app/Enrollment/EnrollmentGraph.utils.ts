export interface SeriesPoint {
  timeDelta: number;
  value: number;
}

export interface CapacityHistoryPoint {
  startTime: string;
  maxEnroll: number | null;
}

export interface CapacityChangeEvent {
  timeDelta: number;
  timestamp: number;
  previousMaxEnroll: number;
  currentMaxEnroll: number;
  percentChange: number;
  direction: "increase" | "decrease";
}

export interface EnrollmentOutputSemesterInfo {
  input: {
    year: number;
    semester: string;
  };
}

const TIME_DELTA_EPSILON = 1e-6;
const MINUTE_MS = 60_000;

export const areOutputsFromSameSemester = (
  outputs: EnrollmentOutputSemesterInfo[]
): boolean => {
  if (outputs.length <= 1) return true;

  const firstOutput = outputs[0];

  return outputs.every(
    (output) =>
      output.input.year === firstOutput.input.year &&
      output.input.semester === firstOutput.input.semester
  );
};

const getMinuteStartMs = (isoDate: string): number | null => {
  const timestampMs = new Date(isoDate).getTime();
  if (Number.isNaN(timestampMs)) return null;
  return Math.floor(timestampMs / MINUTE_MS) * MINUTE_MS;
};

const getCapacityPercentChange = (
  previousMaxEnroll: number,
  currentMaxEnroll: number
) => {
  if (previousMaxEnroll < 1) {
    return currentMaxEnroll >= 1 ? 100 : 0;
  }

  return (Math.abs(currentMaxEnroll - previousMaxEnroll) / previousMaxEnroll) * 100;
};

export const getCapacityChangeEvents = (
  history: CapacityHistoryPoint[]
): CapacityChangeEvent[] => {
  if (history.length < 2) return [];

  const firstTimeMs = getMinuteStartMs(history[0].startTime);
  if (firstTimeMs === null) return [];

  const eventsByTimeDeltaKey = new Map<string, CapacityChangeEvent>();
  let previousMaxEnroll = history[0].maxEnroll ?? 0;

  for (let index = 1; index < history.length; index += 1) {
    const entry = history[index];
    const currentMaxEnroll = entry.maxEnroll ?? 0;
    const startTimeMs = getMinuteStartMs(entry.startTime);

    if (currentMaxEnroll !== previousMaxEnroll && startTimeMs !== null) {
      const percentChange = getCapacityPercentChange(
        previousMaxEnroll,
        currentMaxEnroll
      );

      if (percentChange >= 2.5) {
        const timeDelta = (startTimeMs - firstTimeMs) / MINUTE_MS;
        eventsByTimeDeltaKey.set(timeDelta.toFixed(4), {
          timeDelta,
          timestamp: startTimeMs,
          previousMaxEnroll,
          currentMaxEnroll,
          percentChange,
          direction:
            currentMaxEnroll > previousMaxEnroll ? "increase" : "decrease",
        });
      }
    }

    previousMaxEnroll = currentMaxEnroll;
  }

  return Array.from(eventsByTimeDeltaKey.values()).toSorted(
    (a, b) => a.timeDelta - b.timeDelta
  );
};

export const getCapacityChangeTimeDeltas = (
  history: CapacityHistoryPoint[]
): number[] => getCapacityChangeEvents(history).map((event) => event.timeDelta);

/**
 * Estimate a value at a given timestamp by linearly interpolating between the
 * nearest known points. Returns null when the target lies outside known bounds.
 */
export interface EnrollmentPoint {
  enrolledCount: number | null;
  enrolledPercent: number | null;
  capacityCount: number | null;
  capacityPercent: number | null;
}

export type EnrollmentEntry = [timeDelta: number, point: EnrollmentPoint];

export const getTimeDeltaKey = (timeDelta: number): string =>
  timeDelta.toFixed(4);

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

/**
 * Interpolate an EnrollmentPoint at the given time delta using linear
 * interpolation between the nearest known points in the sorted entry list.
 * Returns null when the target lies outside the known time range.
 */
export const interpolateEnrollmentPoint = (
  sortedEntries: EnrollmentEntry[],
  targetTimeDelta: number
): EnrollmentPoint | null => {
  if (sortedEntries.length === 0) return null;

  let left = 0;
  let right = sortedEntries.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const delta = sortedEntries[mid][0] - targetTimeDelta;

    if (Math.abs(delta) < TIME_DELTA_EPSILON) {
      return sortedEntries[mid][1];
    }

    if (delta < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  const prevEntry = sortedEntries[right];
  const nextEntry = sortedEntries[left];

  if (!prevEntry || !nextEntry) return null;

  const span = nextEntry[0] - prevEntry[0];
  if (Math.abs(span) < TIME_DELTA_EPSILON) return prevEntry[1];

  const ratio = (targetTimeDelta - prevEntry[0]) / span;
  const prev = prevEntry[1];
  const next = nextEntry[1];

  const lerp = (a: number | null, b: number | null): number | null => {
    if (a === null || b === null) return null;
    return a + (b - a) * ratio;
  };

  return {
    enrolledCount: lerp(prev.enrolledCount, next.enrolledCount),
    enrolledPercent: lerp(prev.enrolledPercent, next.enrolledPercent),
    capacityCount: lerp(prev.capacityCount, next.capacityCount),
    capacityPercent: lerp(prev.capacityPercent, next.capacityPercent),
  };
};

const enrollmentPointsEqual = (
  a: EnrollmentPoint,
  b: EnrollmentPoint
): boolean =>
  a.enrolledCount === b.enrolledCount && a.capacityCount === b.capacityCount;

/**
 * Remove interior points of constant-value runs, keeping only boundary points.
 * This is lossless: linear interpolation between two identical values = flat line.
 */
export const compressPlateaus = (
  sortedEntries: EnrollmentEntry[],
  protectedTimeDeltas: number[]
): EnrollmentEntry[] => {
  if (sortedEntries.length <= 2) return sortedEntries;

  const protectedKeys = new Set(protectedTimeDeltas.map(getTimeDeltaKey));

  return sortedEntries.filter(([timeDelta, point], index, arr) => {
    if (index === 0 || index === arr.length - 1) return true;
    if (protectedKeys.has(getTimeDeltaKey(timeDelta))) return true;

    const prev = arr[index - 1][1];
    const next = arr[index + 1][1];
    return (
      !enrollmentPointsEqual(prev, point) ||
      !enrollmentPointsEqual(point, next)
    );
  });
};
