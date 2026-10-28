import { describe, expect, it } from "vitest";

import { Color } from "@/lib/generated/graphql";

import { getNextClassColor, scheduleClassColors } from "./schedule";

describe("scheduleClassColors", () => {
  it("offers a short, distinct categorical palette", () => {
    expect(scheduleClassColors).toEqual([
      Color.Blue,
      Color.Amber,
      Color.Violet,
      Color.Emerald,
      Color.Rose,
      Color.Cyan,
      Color.Pink,
      Color.Lime,
      Color.Fuchsia,
      Color.Slate,
    ]);
    expect(new Set(scheduleClassColors).size).toBe(scheduleClassColors.length);
    expect(scheduleClassColors.length).toBeGreaterThanOrEqual(8);
    expect(scheduleClassColors.length).toBeLessThanOrEqual(10);
  });

  it("assigns new classes from the curated palette", () => {
    expect(getNextClassColor(0)).toBe(Color.Blue);
    expect(getNextClassColor(scheduleClassColors.length)).toBe(Color.Blue);
    expect(getNextClassColor(3)).toBe(Color.Emerald);
  });

  it("still treats legacy theme colors as valid color values", () => {
    const legacyColors = [
      Color.Gray,
      Color.Zinc,
      Color.Neutral,
      Color.Stone,
      Color.Sky,
      Color.Yellow,
      Color.Red,
      Color.Green,
      Color.Orange,
    ];

    for (const color of legacyColors) {
      expect(Object.values(Color)).toContain(color);
      expect(scheduleClassColors).not.toContain(color);
    }
  });
});
