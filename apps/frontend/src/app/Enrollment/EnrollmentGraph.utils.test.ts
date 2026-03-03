import { describe, expect, it } from "vitest";

import { estimateSeriesValueAtTime } from "./EnrollmentGraph.utils";

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
