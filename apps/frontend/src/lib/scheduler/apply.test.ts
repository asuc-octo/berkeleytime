import { describe, expect, it } from "vitest";

import { IScheduleClass } from "@/lib/api";
import { Component } from "@/lib/generated/graphql";

import { applyGeneratedSelection } from "./apply";

const scheduleClass = (
  number: string,
  sectionIds: string[],
  overrides: Record<string, unknown> = {}
) =>
  ({
    class: {
      subject: "COMPSCI",
      courseNumber: "61A",
      number,
      primarySection: { sectionId: sectionIds[0] },
      sections: sectionIds.slice(1).map((sectionId) => ({ sectionId })),
    },
    selectedSections: [{ sectionId: sectionIds[0] }],
    color: "blue",
    hidden: false,
    locked: false,
    blockedSections: [],
    lockedComponents: [],
    ...overrides,
  }) as unknown as IScheduleClass;

describe("applyGeneratedSelection", () => {
  it("changes only the selected sections of generated classes", () => {
    const visible = scheduleClass("001", ["1", "2", "3"], {
      locked: true,
      blockedSections: ["3"],
      lockedComponents: [Component.Lab],
    });
    const hidden = scheduleClass("002", ["4", "5"], { hidden: true });

    const [nextVisible, nextHidden] = applyGeneratedSelection(
      [visible, hidden],
      [
        {
          subject: "COMPSCI",
          courseNumber: "61A",
          number: "001",
          sectionIds: ["1", "2"],
        },
      ]
    );

    expect(nextVisible.selectedSections.map((s) => s.sectionId)).toEqual([
      "1",
      "2",
    ]);
    expect(nextVisible).toMatchObject({
      color: "blue",
      locked: true,
      blockedSections: ["3"],
      lockedComponents: [Component.Lab],
    });
    expect(nextHidden).toBe(hidden);
  });

  it("drops section ids the class does not have", () => {
    const [next] = applyGeneratedSelection(
      [scheduleClass("001", ["1", "2"])],
      [
        {
          subject: "COMPSCI",
          courseNumber: "61A",
          number: "001",
          sectionIds: ["1", "99"],
        },
      ]
    );

    expect(next.selectedSections.map((s) => s.sectionId)).toEqual(["1"]);
  });
});
