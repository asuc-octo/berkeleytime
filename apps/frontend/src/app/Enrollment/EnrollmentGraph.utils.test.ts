import { describe, expect, it } from "vitest";

import {
  areOutputsFromSameSemester,
  estimateSeriesValueAtTime,
  getCapacityChangeTimeDeltas,
} from "./EnrollmentGraph.utils";

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
