/*
 * Builders for tests and benchmarks. Not imported by app code.
 */
import { DEFAULT_PREFERENCES, GeneratorPreferences } from "./preferences";
import { GeneratedSchedule, GeneratorClass, GeneratorSection } from "./types";

export const MON = 0;
export const TUE = 1;
export const WED = 2;
export const THU = 3;
export const FRI = 4;

const clockTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

let nextId = 10000;

/**
 * A section listed the Berkeley way: a one-hour class at 10 is listed as
 * 10:00-10:59.
 */
export const section = (
  component: string,
  days: number[],
  startHour: number,
  {
    hours = 1,
    status = "O",
    enrolled = 10,
    startDate,
    endDate,
  }: {
    hours?: number;
    status?: "O" | "C";
    enrolled?: number;
    startDate?: string;
    endDate?: string;
  } = {}
): GeneratorSection => ({
  sectionId: String(nextId++),
  component,
  startDate,
  endDate,
  meetings: [
    {
      days: [0, 1, 2, 3, 4, 5, 6].map((day) => days.includes(day)),
      startTime: clockTime(Math.round(startHour * 60)),
      endTime: clockTime(Math.round(startHour * 60) + hours * 60 - 1),
    },
  ],
  enrollment: { latest: { status, enrolledCount: enrolled, maxEnroll: 30 } },
});

export const scheduleClass = (
  primarySection: GeneratorSection,
  sections: GeneratorSection[],
  options: Partial<GeneratorClass> = {}
): GeneratorClass => ({
  class: { primarySection, sections },
  selectedSections: [],
  ...options,
});

/** Defaults with fewer gaps off, so each test turns on only what it checks. */
export const preferences = (
  overrides: Partial<GeneratorPreferences> = {}
): GeneratorPreferences => ({
  ...DEFAULT_PREFERENCES,
  fewerGaps: false,
  ...overrides,
});

/** The real sections a generated schedule uses. */
export const sectionsOf = (
  classes: GeneratorClass[],
  schedule: GeneratedSchedule
) =>
  schedule.classes.flatMap(({ classIndex, sections }) =>
    sections.map(({ sectionId }) => {
      const { primarySection, sections: all } = classes[classIndex].class;
      const found = [primarySection, ...all].find(
        (candidate) => candidate?.sectionId === sectionId
      );
      if (!found) throw new Error(`Unknown section ${sectionId}`);
      return found;
    })
  );

const minutesOf = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/** Raw listed intervals, without any rounding, for independent checks. */
export const intervalsOf = (sections: GeneratorSection[]) =>
  sections.flatMap((s) =>
    s.meetings.flatMap((meeting) =>
      (meeting.days ?? []).flatMap((meets, day) =>
        meets && meeting.startTime && meeting.endTime
          ? [
              {
                day,
                start: minutesOf(meeting.startTime),
                end: minutesOf(meeting.endTime),
              },
            ]
          : []
      )
    )
  );

export const hasOverlap = (sections: GeneratorSection[]) => {
  const intervals = intervalsOf(sections);
  return intervals.some((a, i) =>
    intervals.some(
      (b, j) => i < j && a.day === b.day && a.start < b.end && b.start < a.end
    )
  );
};

/** A key that is equal for schedules that look the same on a calendar. */
export const timesOf = (sections: GeneratorSection[]) =>
  intervalsOf(sections)
    .map(({ day, start, end }) => `${day}:${start}-${end}`)
    .sort()
    .join("|");

/** Repeatable random numbers in [0, 1). */
export const seededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2 ** 31;
    return state / 2 ** 31;
  };
};

/**
 * `count` sections spread over `times` distinct meeting patterns, so several
 * sections share each time, as in large Berkeley classes.
 */
const component = (
  random: () => number,
  name: string,
  count: number,
  times: number,
  pattern: () => { days: number[]; startHour: number; hours: number }
) => {
  const patterns = Array.from({ length: times }, pattern);
  return Array.from({ length: count }, (_, index) => {
    const { days, startHour, hours } = patterns[index % times];
    return section(name, days, startHour, {
      hours,
      status: random() < 0.15 ? "C" : "O",
      enrolled: Math.floor(random() * 30),
    });
  });
};

const pick = <T>(random: () => number, options: T[]) =>
  options[Math.floor(random() * options.length)];

/** Four large lower-division classes (the design doc's realistic case). */
export const realisticClasses = (seed = 7): GeneratorClass[] => {
  const random = seededRandom(seed);
  const oneDay = () => ({
    days: [pick(random, [MON, TUE, WED, THU, FRI])],
    startHour: 8 + Math.floor(random() * 11),
    hours: 1,
  });
  const twoDays = () => ({
    days: pick(random, [
      [MON, WED],
      [TUE, THU],
    ]),
    startHour: 8 + Math.floor(random() * 10),
    hours: 1,
  });
  const lab = (hours: number) => () => ({
    days: [pick(random, [MON, TUE, WED, THU, FRI])],
    startHour: 8 + Math.floor(random() * (12 - hours)),
    hours,
  });

  return [
    scheduleClass(section("LEC", [MON, WED, FRI], 13), [
      ...component(random, "DIS", 40, 14, oneDay),
      ...component(random, "LAB", 30, 12, lab(2)),
    ]),
    scheduleClass(
      section("LEC", [MON, WED, FRI], 10),
      component(random, "LAB", 35, 15, lab(2))
    ),
    scheduleClass(section("LEC", [MON, WED, FRI], 9), [
      ...component(random, "DIS", 25, 12, twoDays),
      ...component(random, "LAB", 25, 10, lab(3)),
    ]),
    scheduleClass(
      section("LEC", [TUE, THU], 12.5, { hours: 1.5 }),
      component(random, "DIS", 12, 8, twoDays)
    ),
  ];
};

/**
 * Four classes, each with 60 discussions at 30 times and 60 labs at 30
 * times: about 1.7 x 10^14 raw combinations.
 */
export const adversarialClasses = (seed = 7): GeneratorClass[] => {
  const random = seededRandom(seed);
  const oneDay = (hours: number) => () => ({
    days: [pick(random, [MON, TUE, WED, THU, FRI])],
    startHour: 8 + Math.floor(random() * (12 - hours)),
    hours,
  });

  return [0, 1, 2, 3].map((index) =>
    scheduleClass(
      section(
        "LEC",
        index % 2 === 0 ? [MON, WED, FRI] : [TUE, THU],
        9 + 2 * index
      ),
      [
        ...component(random, "DIS", 60, 30, oneDay(1)),
        ...component(random, "LAB", 60, 30, oneDay(2)),
      ]
    )
  );
};
