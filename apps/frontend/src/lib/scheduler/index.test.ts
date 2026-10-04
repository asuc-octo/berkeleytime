import { describe, expect, it } from "vitest";

import {
  FRI,
  MON,
  THU,
  TUE,
  WED,
  adversarialClasses,
  hasOverlap,
  intervalsOf,
  preferences,
  realisticClasses,
  scheduleClass,
  section,
  sectionsOf,
  seededRandom,
  timesOf,
} from "./fixtures";
import { GeneratorEvent, GeneratorSection, generateSchedules } from "./index";

const sectionIdsOf = (
  schedule: ReturnType<typeof generateSchedules>["schedules"][number],
  classIndex: number
) => schedule.classes[classIndex].sections.map(({ sectionId }) => sectionId);

describe("generateSchedules", () => {
  it("finds schedules for a class past the old 500-combination limit", () => {
    const discussions = Array.from({ length: 25 }, (_, i) =>
      section("DIS", [i % 5], 8 + (i % 9))
    );
    const labs = Array.from({ length: 21 }, (_, i) =>
      section("LAB", [(i + 2) % 5], 9 + (i % 7), { hours: 2 })
    );
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), [
        ...discussions,
        ...labs,
      ]),
    ];

    const { schedules, quality } = generateSchedules(
      classes,
      [],
      preferences()
    );

    expect(quality).toEqual({ kind: "optimal" });
    expect(schedules).toHaveLength(8);
    for (const schedule of schedules) {
      const chosen = sectionsOf(classes, schedule);
      expect(chosen.map((s) => s.component).sort()).toEqual([
        "DIS",
        "LAB",
        "LEC",
      ]);
      expect(hasOverlap(chosen)).toBe(false);
    }
  });

  it("never returns schedules that differ only by sections meeting at the same time", () => {
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), [
        section("DIS", [TUE], 9),
        section("DIS", [TUE], 9),
        section("DIS", [THU], 9),
      ]),
    ];

    const { schedules } = generateSchedules(classes, [], preferences());

    expect(schedules).toHaveLength(2);
    const times = schedules.map((s) => timesOf(sectionsOf(classes, s)));
    expect(new Set(times).size).toBe(2);
  });

  it("treats events as hard constraints", () => {
    const thursday = section("DIS", [THU], 9);
    const classes = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), [
        section("DIS", [TUE], 9),
        thursday,
      ]),
    ];
    const events: GeneratorEvent[] = [
      {
        days: [false, true, false, false, false, false, false],
        startTime: "08:00",
        endTime: "12:00",
      },
    ];

    const { schedules } = generateSchedules(classes, events, preferences());

    expect(schedules).toHaveLength(1);
    expect(sectionIdsOf(schedules[0], 0)).toContain(thursday.sectionId);
  });

  it("keeps locked classes and components and skips excluded sections", () => {
    const lecture = section("LEC", [MON, WED, FRI], 10);
    const [first, second, third] = [TUE, WED, THU].map((day) =>
      section("DIS", [day], 14)
    );
    const fridayDiscussion = section("DIS", [FRI], 15);
    const blockedLab = section("LAB", [MON], 16);

    const classes = [
      scheduleClass(lecture, [first, second, third], {
        locked: true,
        selectedSections: [
          { sectionId: lecture.sectionId },
          { sectionId: second.sectionId },
        ],
      }),
      scheduleClass(
        section("LEC", [TUE, THU], 11),
        [section("DIS", [MON], 15), fridayDiscussion],
        {
          lockedComponents: ["DIS"],
          selectedSections: [{ sectionId: fridayDiscussion.sectionId }],
        }
      ),
      scheduleClass(
        section("LEC", [TUE, THU], 9),
        [blockedLab, section("LAB", [FRI], 16)],
        { blockedSections: [blockedLab.sectionId] }
      ),
    ];

    const { schedules } = generateSchedules(classes, [], preferences());

    expect(schedules.length).toBeGreaterThan(0);
    for (const schedule of schedules) {
      expect([...sectionIdsOf(schedule, 0)].sort()).toEqual(
        [lecture.sectionId, second.sectionId].sort()
      );
      expect(sectionIdsOf(schedule, 1)).toContain(fridayDiscussion.sectionId);
      expect(sectionIdsOf(schedule, 2)).not.toContain(blockedLab.sectionId);
    }
  });

  it("leaves a component out when every section of it is excluded", () => {
    const lab = section("LAB", [MON], 16);
    const classes = [
      scheduleClass(
        section("LEC", [MON, WED, FRI], 10),
        [section("DIS", [TUE], 9), lab],
        { blockedSections: [lab.sectionId] }
      ),
    ];

    const { schedules } = generateSchedules(classes, [], preferences());

    expect(schedules).toHaveLength(1);
    expect(sectionsOf(classes, schedules[0]).map((s) => s.component)).toEqual([
      "LEC",
      "DIS",
    ]);
  });

  it("ranks by the preferred hours and avoided days", () => {
    const early = section("DIS", [MON], 8);
    const friday = section("DIS", [FRI], 13);
    const wednesday = section("DIS", [WED], 15);
    const classes = [
      scheduleClass(section("LEC", [TUE, THU], 11), [early, friday, wednesday]),
    ];

    const { schedules } = generateSchedules(
      classes,
      [],
      preferences({
        earliestStart: 10 * 60,
        avoidDays: [false, false, false, false, true, false, false],
      })
    );

    expect(schedules.map((s) => sectionIdsOf(s, 0)[1])).toEqual([
      wednesday.sectionId,
      early.sectionId,
      friday.sectionId,
    ]);
  });

  it("does not schedule around times that are not announced yet", () => {
    const tba: GeneratorSection = {
      ...section("DIS", [], 0),
      meetings: [{ days: [], startTime: "00:00:00", endTime: "00:00:00" }],
    };
    const classes = [scheduleClass(section("LEC", [MON], 10), [tba])];

    const { schedules } = generateSchedules(
      classes,
      [],
      preferences({ earliestStart: 9 * 60 })
    );

    expect(schedules).toHaveLength(1);
    expect(schedules[0].cost).toBe(0);
  });

  it("lets sections in different weeks share a time slot", () => {
    const firstHalf = section("LEC", [MON, WED, FRI], 10, {
      startDate: "2026-08-26",
      endDate: "2026-10-16",
    });
    const secondHalf = section("LEC", [MON, WED, FRI], 10, {
      startDate: "2026-10-19",
      endDate: "2026-12-11",
    });

    const { schedules } = generateSchedules(
      [scheduleClass(firstHalf, []), scheduleClass(secondHalf, [])],
      [],
      preferences()
    );

    expect(schedules).toHaveLength(1);
  });

  it("does not count Berkeley passing time as a gap", () => {
    const classes = [
      scheduleClass(section("LEC", [MON], 10), []),
      scheduleClass(section("LEC", [MON], 11), []),
      scheduleClass(section("LEC", [MON], 14), []),
    ];

    const [schedule] = generateSchedules(classes, [], preferences()).schedules;

    // 10:00-10:59 and 11:00-11:59 touch; 12:00-14:00 is a real gap.
    expect(schedule.gapMinutes).toBe(120);
  });

  it("lists backups: same-time sections first, then other times that fit", () => {
    const sameTime = [section("DIS", [TUE], 9), section("DIS", [TUE], 9)];
    const otherTime = section("DIS", [THU], 9);
    const clashing = section("DIS", [WED], 9);
    const classes = [
      scheduleClass(section("LEC", [MON], 13), [
        ...sameTime,
        otherTime,
        clashing,
      ]),
      scheduleClass(section("LEC", [WED], 9), []),
    ];

    const { schedules } = generateSchedules(
      classes,
      [],
      preferences({ earliestStart: 9 * 60 })
    );
    const discussion = schedules[0].classes[0].sections[1];

    const chosenTime = sameTime.find(
      (s) => s.sectionId === discussion.sectionId
    )
      ? "TUE"
      : "THU";
    if (chosenTime === "TUE") {
      expect(discussion.backups).toEqual([
        sameTime.find((s) => s.sectionId !== discussion.sectionId)!.sectionId,
        otherTime.sectionId,
      ]);
    } else {
      expect(discussion.backups).toEqual(sameTime.map((s) => s.sectionId));
    }
    expect(discussion.backups).not.toContain(clashing.sectionId);
  });

  it("explains why nothing fits", () => {
    const overlapping = [
      scheduleClass(section("LEC", [MON, WED, FRI], 10), []),
      scheduleClass(section("LEC", [MON, WED, FRI], 10), []),
    ];
    expect(generateSchedules(overlapping, [], preferences()).reasons).toEqual([
      { kind: "pair", classIndexes: [0, 1] },
    ]);

    const allClosed = [
      scheduleClass(section("LEC", [MON], 10), [
        section("DIS", [TUE], 9, { status: "C" }),
        section("DIS", [THU], 9, { status: "C" }),
      ]),
    ];
    expect(
      generateSchedules(allClosed, [], preferences({ onlyOpenSections: true }))
        .reasons
    ).toEqual([{ kind: "closed", classIndex: 0, component: "DIS" }]);
  });

  describe("against brute force on random inputs", () => {
    const random = seededRandom(7);
    const pick = (max: number) => Math.floor(random() * max);

    const instances = Array.from({ length: 40 }, () =>
      Array.from({ length: 3 }, () =>
        scheduleClass(
          section(
            "LEC",
            [
              [MON, WED, FRI],
              [TUE, THU],
            ][pick(2)],
            8 + pick(9)
          ),
          [
            ...Array.from({ length: 2 + pick(5) }, () =>
              section("DIS", [pick(5)], 8 + pick(10))
            ),
            ...Array.from({ length: pick(4) }, () =>
              section("LAB", [pick(5)], 8 + pick(9), { hours: 2 })
            ),
          ]
        )
      )
    );

    // Every combination of one section per component, without overlaps.
    const validSchedules = (classes: ReturnType<typeof scheduleClass>[]) => {
      const options = classes.flatMap(
        ({ class: { primarySection, sections } }) => {
          const byComponent = new Map<string, GeneratorSection[]>();
          for (const s of [primarySection!, ...sections])
            byComponent.set(s.component, [
              ...(byComponent.get(s.component) ?? []),
              s,
            ]);
          return [...byComponent.values()];
        }
      );
      const valid: GeneratorSection[][] = [];
      const walk = (index: number, chosen: GeneratorSection[]) => {
        if (hasOverlap(chosen)) return;
        if (index === options.length) return void valid.push(chosen);
        for (const option of options[index])
          walk(index + 1, [...chosen, option]);
      };
      walk(0, []);
      return valid;
    };

    const earlyMinutes = (chosen: GeneratorSection[]) =>
      intervalsOf(chosen).reduce(
        (sum, { start }) => sum + Math.max(0, 10 * 60 - start),
        0
      );
    const days = (chosen: GeneratorSection[]) =>
      new Set(intervalsOf(chosen).map(({ day }) => day)).size;

    it("puts the true best schedule first", () => {
      for (const classes of instances) {
        const valid = validSchedules(classes);
        const byStart = generateSchedules(
          classes,
          [],
          preferences({ earliestStart: 10 * 60 })
        );
        const byDays = generateSchedules(
          classes,
          [],
          preferences({ fewerDays: true })
        );

        if (valid.length === 0) {
          expect(byStart.schedules).toHaveLength(0);
          expect(byStart.reasons.length).toBeGreaterThan(0);
          continue;
        }

        expect(byStart.quality).toEqual({ kind: "optimal" });
        expect(earlyMinutes(sectionsOf(classes, byStart.schedules[0]))).toBe(
          Math.min(...valid.map(earlyMinutes))
        );
        expect(days(sectionsOf(classes, byDays.schedules[0]))).toBe(
          Math.min(...valid.map(days))
        );

        const distinct = new Set(
          byStart.schedules.map((s) => timesOf(sectionsOf(classes, s)))
        );
        expect(distinct.size).toBe(byStart.schedules.length);
        for (const schedule of [...byStart.schedules, ...byDays.schedules])
          expect(hasOverlap(sectionsOf(classes, schedule))).toBe(false);
      }
    });

    it("stays within the gap when it approximates", () => {
      const gap = 0.2;

      for (const classes of instances) {
        const valid = validSchedules(classes);
        if (valid.length === 0) continue;

        // A zero soft budget makes the search prune with the gap from the
        // start.
        const result = generateSchedules(
          classes,
          [],
          preferences({ earliestStart: 10 * 60 }),
          { softBudgetMs: 0, gap }
        );

        expect(result.quality).toEqual({ kind: "near-optimal", gap });
        const best = Math.min(...valid.map(earlyMinutes));
        expect(
          earlyMinutes(sectionsOf(classes, result.schedules[0]))
        ).toBeLessThanOrEqual(best * (1 + gap));
      }
    });
  });

  it("respects the hard budget on a very large input", () => {
    const classes = adversarialClasses();
    const started = performance.now();

    const result = generateSchedules(
      classes,
      [],
      preferences({ fewerGaps: true, fewerDays: true }),
      { softBudgetMs: 5, hardBudgetMs: 40 }
    );

    expect(performance.now() - started).toBeLessThan(400);
    expect(result.schedules.length).toBeGreaterThan(0);
    for (const schedule of result.schedules)
      expect(hasOverlap(sectionsOf(classes, schedule))).toBe(false);
  });

  it("solves the realistic case exactly within the default budget", () => {
    const classes = realisticClasses();

    const result = generateSchedules(
      classes,
      [],
      preferences({ fewerGaps: true, earliestStart: 10 * 60 })
    );

    expect(result.schedules).toHaveLength(8);
    expect(result.quality.kind).not.toBe("best-found");
  });
});
