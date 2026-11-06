import { describe, expect, it } from "vitest";

import { Day } from "../browser";
import { daysToSelectedFlags, selectedFlagsToDays } from "./daySelection";

describe("day selection", () => {
  it("shows the days a catalog link asked for", () => {
    const flags = daysToSelectedFlags([Day.Monday, Day.Wednesday]);

    expect(flags).toEqual([false, true, false, true, false, false, false]);
  });

  it("reads the checkbox row back into the day filter", () => {
    const flags = [false, true, false, true, false, false, false];

    expect(selectedFlagsToDays(flags)).toEqual([Day.Monday, Day.Wednesday]);
  });

  it("clears the filter when every box is unchecked", () => {
    expect(selectedFlagsToDays(daysToSelectedFlags([]))).toEqual([]);
  });

  it("round-trips every day", () => {
    const allDays = Object.values(Day);

    expect(selectedFlagsToDays(daysToSelectedFlags(allDays))).toEqual(allDays);
  });
});
