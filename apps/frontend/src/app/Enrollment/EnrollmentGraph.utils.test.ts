import { describe, expect, it } from "vitest";

import {
  type EnrollmentEntry,
  type EnrollmentPoint,
  areOutputsFromSameSemester,
  compressPlateaus,
  estimateSeriesValueAtTime,
  getCapacityChangeEvents,
  getCapacityChangeTimeDeltas,
} from "./EnrollmentGraph.utils";

describe("getCapacityChangeEvents", () => {
  it("returns events with direction and percent change", () => {
    const history = [
      { startTime: "2024-08-20T08:00:12.000Z", maxEnroll: 100 },
      { startTime: "2024-08-20T08:30:30.000Z", maxEnroll: 100 },
      { startTime: "2024-08-20T09:00:09.000Z", maxEnroll: 120 },
      { startTime: "2024-08-20T10:00:00.000Z", maxEnroll: 80 },
    ];

    const events = getCapacityChangeEvents(history);

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      timeDelta: 60,
      previousMaxEnroll: 100,
      currentMaxEnroll: 120,
      direction: "increase",
    });
    expect(events[0]?.percentChange).toBeCloseTo(20, 5);

    expect(events[1]).toMatchObject({
      timeDelta: 120,
      previousMaxEnroll: 120,
      currentMaxEnroll: 80,
      direction: "decrease",
    });
    expect(events[1]?.percentChange).toBeCloseTo(33.3333333333, 5);
  });

  it("ignores changes below 2.5%", () => {
    const history = [
      { startTime: "2024-08-20T08:00:00.000Z", maxEnroll: 200 },
      { startTime: "2024-08-20T08:30:00.000Z", maxEnroll: 204 }, // 2% change
      { startTime: "2024-08-20T09:00:00.000Z", maxEnroll: 220 }, // ~7.8% change
    ];

    const events = getCapacityChangeEvents(history);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      previousMaxEnroll: 204,
      currentMaxEnroll: 220,
      direction: "increase",
    });
  });

  it("handles changes from zero capacity", () => {
    const history = [
      { startTime: "2024-08-20T08:00:00.000Z", maxEnroll: 0 },
      { startTime: "2024-08-20T08:20:00.000Z", maxEnroll: 10 },
    ];

    expect(getCapacityChangeEvents(history)[0]).toMatchObject({
      direction: "increase",
      percentChange: 100,
    });
  });
});

describe("getCapacityChangeTimeDeltas", () => {
  it("returns change time deltas when max enrollment shifts", () => {
    const history = [
      { startTime: "2024-08-20T08:00:12.000Z", maxEnroll: 100 },
      { startTime: "2024-08-20T08:30:30.000Z", maxEnroll: 100 },
      { startTime: "2024-08-20T09:00:09.000Z", maxEnroll: 120 },
      { startTime: "2024-08-20T09:15:02.000Z", maxEnroll: 120 },
      { startTime: "2024-08-20T10:00:00.000Z", maxEnroll: 80 },
    ];

    expect(getCapacityChangeTimeDeltas(history)).toEqual([60, 120]);
  });

  it("treats null maxEnroll as zero and ignores unchanged values", () => {
    const history = [
      { startTime: "2024-08-20T08:00:00.000Z", maxEnroll: null },
      { startTime: "2024-08-20T08:10:00.000Z", maxEnroll: 0 },
      { startTime: "2024-08-20T08:20:00.000Z", maxEnroll: 5 },
    ];

    expect(getCapacityChangeTimeDeltas(history)).toEqual([20]);
  });

  it("returns an empty list for short histories", () => {
    expect(
      getCapacityChangeTimeDeltas([
        { startTime: "2024-08-20T08:00:00.000Z", maxEnroll: 50 },
      ])
    ).toEqual([]);
  });
});

describe("estimateSeriesValueAtTime", () => {
  const points = [
    { timeDelta: 0, value: 10 },
    { timeDelta: 30, value: 25 },
    { timeDelta: 60, value: 55 },
  ];

  it("returns exact values for exact timestamps", () => {
    expect(estimateSeriesValueAtTime(points, 30)).toBe(25);
  });

  it("linearly interpolates between known points", () => {
    // midpoint between 10 and 25
    expect(estimateSeriesValueAtTime(points, 15)).toBe(17.5);
    // one-third into the last segment
    expect(estimateSeriesValueAtTime(points, 40)).toBe(35);
  });

  it("returns null when timestamp is before first point", () => {
    expect(estimateSeriesValueAtTime(points, -1)).toBeNull();
  });

  it("returns null when timestamp is after last point", () => {
    expect(estimateSeriesValueAtTime(points, 61)).toBeNull();
  });

  it("returns null for an empty point set", () => {
    expect(estimateSeriesValueAtTime([], 10)).toBeNull();
  });
});

describe("areOutputsFromSameSemester", () => {
  it("returns true when there are no outputs", () => {
    expect(areOutputsFromSameSemester([])).toBe(true);
  });

  it("returns true for a single output", () => {
    expect(
      areOutputsFromSameSemester([
        {
          input: {
            year: 2026,
            semester: "Spring",
          },
        },
      ])
    ).toBe(true);
  });

  it("returns true when all outputs share year and semester", () => {
    expect(
      areOutputsFromSameSemester([
        {
          input: {
            year: 2026,
            semester: "Spring",
          },
        },
        {
          input: {
            year: 2026,
            semester: "Spring",
          },
        },
      ])
    ).toBe(true);
  });

  it("returns false when any output has a different year", () => {
    expect(
      areOutputsFromSameSemester([
        {
          input: {
            year: 2026,
            semester: "Spring",
          },
        },
        {
          input: {
            year: 2025,
            semester: "Spring",
          },
        },
      ])
    ).toBe(false);
  });

  it("returns false when any output has a different semester", () => {
    expect(
      areOutputsFromSameSemester([
        {
          input: {
            year: 2026,
            semester: "Spring",
          },
        },
        {
          input: {
            year: 2026,
            semester: "Fall",
          },
        },
      ])
    ).toBe(false);
  });
});

// Helper to create EnrollmentPoint tuples for reduction tests
const ep = (
  enrolled: number,
  capacity: number
): EnrollmentPoint => ({
  enrolledCount: enrolled,
  enrolledPercent: null,
  capacityCount: capacity,
  capacityPercent: null,
});

const entry = (
  timeDelta: number,
  enrolled: number,
  capacity: number
): EnrollmentEntry => [timeDelta, ep(enrolled, capacity)];

describe("compressPlateaus", () => {
  it("returns empty array unchanged", () => {
    expect(compressPlateaus([], [])).toEqual([]);
  });

  it("returns single-point array unchanged", () => {
    const entries: EnrollmentEntry[] = [entry(0, 100, 200)];
    expect(compressPlateaus(entries, [])).toEqual(entries);
  });

  it("returns two-point array unchanged", () => {
    const entries: EnrollmentEntry[] = [entry(0, 100, 200), entry(60, 100, 200)];
    expect(compressPlateaus(entries, [])).toEqual(entries);
  });

  it("compresses 10-point flat plateau to 2 points", () => {
    const entries: EnrollmentEntry[] = Array.from({ length: 10 }, (_, i) =>
      entry(i * 15, 100, 200)
    );
    const result = compressPlateaus(entries, []);
    expect(result).toHaveLength(2);
    expect(result[0][0]).toBe(0);
    expect(result[1][0]).toBe(135);
  });

  it("preserves transition boundary points on both sides", () => {
    // A, A, B, B → all 4 kept (boundary points)
    const entries: EnrollmentEntry[] = [
      entry(0, 100, 200),
      entry(15, 100, 200),
      entry(30, 120, 200),
      entry(45, 120, 200),
    ];
    const result = compressPlateaus(entries, []);
    expect(result).toHaveLength(4);
  });

  it("keeps protected time deltas even mid-plateau", () => {
    const entries: EnrollmentEntry[] = Array.from({ length: 5 }, (_, i) =>
      entry(i * 15, 100, 200)
    );
    // Protect the middle point (timeDelta=30)
    const result = compressPlateaus(entries, [30]);
    expect(result).toHaveLength(3); // first, protected, last
    expect(result[1][0]).toBe(30);
  });

  it("handles alternating values with no plateaus", () => {
    const entries: EnrollmentEntry[] = [
      entry(0, 100, 200),
      entry(15, 110, 200),
      entry(30, 100, 200),
      entry(45, 110, 200),
    ];
    const result = compressPlateaus(entries, []);
    expect(result).toHaveLength(4); // no compression possible
  });
});

