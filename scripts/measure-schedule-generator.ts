/**
 * Phase 0 of the schedule generator redesign: read-only measurements of the
 * data the generator works with. Nothing is written to the database.
 *
 * Run from repo root: npx tsx scripts/measure-schedule-generator.ts
 * Optional term (defaults to the newest with sections): --term "2026 Fall"
 * Point MONGODB_URI at another database to measure it instead of local.
 */
import mongoose from "mongoose";

import type { ISectionItem } from "@repo/common/models";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:3008/bt?directConnection=true";

// The combination count above which the original generator gave up
const LEGACY_COMBINATION_CAP = 500;

// Placeholder sections carry stand-in times like 00:00-00:01, so anything
// shorter than this is not treated as a real meeting
const MIN_MEETING_MINUTES = 10;

const SEMESTER_ORDER = ["Spring", "Summer", "Fall"];

type Section = Pick<
  ISectionItem,
  | "sectionId"
  | "sessionId"
  | "subject"
  | "courseNumber"
  | "number"
  | "primary"
  | "component"
  | "type"
  | "graded"
  | "status"
  | "associatedSectionIds"
  | "associatedClass"
  | "meetings"
>;

type Meeting = NonNullable<Section["meetings"]>[number];

interface ClassGroup {
  label: string;
  primary: Section;
  secondaries: Section[];
}

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isScheduled = (meeting: Meeting) =>
  !!meeting.days?.some(Boolean) &&
  !!meeting.startTime &&
  !!meeting.endTime &&
  toMinutes(meeting.endTime) - toMinutes(meeting.startTime) >=
    MIN_MEETING_MINUTES;

// Sections with the same key occupy the same time slot; "" means unscheduled
const getTimeKey = (section: Section, withDates: boolean) =>
  (section.meetings ?? [])
    .filter(isScheduled)
    .map((meeting) => {
      const days = meeting.days!.map((day) => (day ? 1 : 0)).join("");
      const dates = withDates ? `|${meeting.startDate}-${meeting.endDate}` : "";
      return `${days}@${meeting.startTime}-${meeting.endTime}${dates}`;
    })
    .sort()
    .join(",");

const percentile = (sorted: number[], p: number) =>
  sorted.length === 0
    ? 0
    : sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

const describe = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    median: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    p99: percentile(sorted, 0.99),
    max: sorted[sorted.length - 1] ?? 0,
  };
};

const tally = <T>(items: T[], getKey: (item: T) => string) => {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.fromEntries([...counts].sort((a, b) => b[1] - a[1]));
};

const percent = (part: number, whole: number) =>
  whole === 0 ? "n/a" : `${((100 * part) / whole).toFixed(1)}%`;

const heading = (title: string) => console.log(`\n=== ${title} ===`);

const resolveTerm = async (db: mongoose.mongo.Db) => {
  const index = process.argv.indexOf("--term");

  if (index !== -1) {
    const [year, semester] = (process.argv[index + 1] ?? "").split(" ");
    if (!Number(year) || !SEMESTER_ORDER.includes(semester))
      throw new Error('Expected --term "<year> <semester>"');

    return { year: Number(year), semester };
  }

  const terms = await db
    .collection("sections")
    .aggregate<{ _id: { year: number; semester: string } }>([
      { $group: { _id: { year: "$year", semester: "$semester" } } },
    ])
    .toArray();

  if (terms.length === 0) throw new Error("No sections in this database");

  return terms
    .map((term) => term._id)
    .sort(
      (a, b) =>
        b.year - a.year ||
        SEMESTER_ORDER.indexOf(b.semester) - SEMESTER_ORDER.indexOf(a.semester)
    )[0];
};

// Mirrors getSecondarySections in apps/backend/src/modules/class/controller.ts
const groupClasses = (sections: Section[]) => {
  const courseKey = (section: Section) =>
    `${section.sessionId}|${section.subject}|${section.courseNumber}`;

  const secondariesByCourse = new Map<string, Section[]>();

  for (const section of sections) {
    if (section.primary !== false) continue;

    const courseSections = secondariesByCourse.get(courseKey(section));

    if (courseSections) courseSections.push(section);
    else secondariesByCourse.set(courseKey(section), [section]);
  }

  const attachments = new Map<string, number>();
  let fallbackClasses = 0;

  const classes = sections
    .filter((section) => section.primary === true)
    .map((primary): ClassGroup => {
      const candidates = secondariesByCourse.get(courseKey(primary)) ?? [];

      let secondaries = candidates.filter((section) =>
        section.associatedSectionIds?.includes(primary.sectionId)
      );

      if (secondaries.length === 0) {
        secondaries = candidates.filter(
          (section) => section.associatedClass === parseInt(primary.number)
        );
        if (secondaries.length > 0) fallbackClasses++;
      }

      for (const section of secondaries)
        attachments.set(
          section.sectionId,
          (attachments.get(section.sectionId) ?? 0) + 1
        );

      return {
        label: `${primary.subject} ${primary.courseNumber} ${primary.number}`,
        primary,
        secondaries,
      };
    });

  const secondaries = sections.filter((section) => section.primary === false);

  return {
    classes,
    fallbackClasses,
    orphans: secondaries.filter(
      (section) => !attachments.has(section.sectionId)
    ),
    shared: secondaries.filter(
      (section) => (attachments.get(section.sectionId) ?? 0) > 1
    ),
  };
};

// The generator makes one choice per component of a class, the primary
// section's component included
const countChoices = ({ primary, secondaries }: ClassGroup) => {
  const byComponent = new Map<string, Section[]>();

  for (const section of [primary, ...secondaries]) {
    if (!section.component) continue;

    const componentSections = byComponent.get(section.component);

    if (componentSections) componentSections.push(section);
    else byComponent.set(section.component, [section]);
  }

  let raw = 1;
  let merged = 1;
  let mergedWithDates = 1;

  for (const componentSections of byComponent.values()) {
    const countSlots = (withDates: boolean) => {
      const keys = new Set(
        componentSections.map((section) => getTimeKey(section, withDates))
      );

      // Placeholder sections without a real time are ignored when others exist
      if (keys.size > 1) keys.delete("");

      return keys.size;
    };

    raw *= componentSections.length;
    merged *= countSlots(false);
    mergedWithDates *= countSlots(true);
  }

  return { raw, merged, mergedWithDates, components: byComponent.size };
};

const reportClasses = (sections: Section[]) => {
  const { classes, fallbackClasses, orphans, shared } = groupClasses(sections);
  const withSecondaries = classes.filter(
    (group) => group.secondaries.length > 0
  );

  heading("Grouping sections into classes");
  console.log({
    sections: sections.length,
    classes: classes.length,
    classesWithSecondarySections: withSecondaries.length,
    primaryOnlyClasses: classes.length - withSecondaries.length,
    classesGroupedByAssociatedClassFallback: fallbackClasses,
    secondarySectionsWithNoClass: orphans.length,
    secondarySectionsSharedByClasses: shared.length,
  });

  if (orphans.length > 0)
    console.log(
      "Courses with unattached secondary sections:",
      tally(orphans, (section) => `${section.subject} ${section.courseNumber}`)
    );

  const choices = withSecondaries.map((group) => ({
    label: group.label,
    ...countChoices(group),
  }));

  const sum = (getValue: (choice: (typeof choices)[number]) => number) =>
    choices.reduce((total, choice) => total + getValue(choice), 0);

  heading("Combinations per class (classes with secondary sections)");
  console.log("Raw (one section per component):", {
    ...describe(choices.map((choice) => choice.raw)),
    [`classesOver${LEGACY_COMBINATION_CAP}`]: choices.filter(
      (choice) => choice.raw > LEGACY_COMBINATION_CAP
    ).length,
  });
  console.log("Merged by meeting time:", {
    ...describe(choices.map((choice) => choice.merged)),
    [`classesOver${LEGACY_COMBINATION_CAP}`]: choices.filter(
      (choice) => choice.merged > LEGACY_COMBINATION_CAP
    ).length,
  });
  console.log("Merge ratio (raw / merged):", {
    ...describe(choices.map((choice) => choice.raw / choice.merged)),
    overall: (
      sum((choice) => choice.raw) / sum((choice) => choice.merged)
    ).toFixed(2),
  });
  console.log(
    "Classes whose slot count changes if date ranges also have to match:",
    choices.filter((choice) => choice.mergedWithDates !== choice.merged).length
  );
  console.log(
    "Components per class:",
    tally(choices, (choice) => String(choice.components))
  );

  console.log("Largest classes by raw combinations:");
  console.table(
    [...choices]
      .sort((a, b) => b.raw - a.raw)
      .slice(0, 15)
      .map(({ label, raw, merged, components }) => ({
        class: label,
        components,
        raw,
        merged,
      }))
  );

  return withSecondaries;
};

const reportComponents = (sections: Section[], classes: ClassGroup[]) => {
  heading("Component mix");
  console.log(
    "Sections by role / component / type / graded:",
    tally(
      sections,
      (section) =>
        `${section.primary ? "primary" : "secondary"} ${section.component} type=${section.type} graded=${section.graded}`
    )
  );

  const secondaries = sections.filter((section) => section.primary === false);
  const unscheduled = secondaries.filter(
    (section) => getTimeKey(section, false) === ""
  );

  console.log(
    `Secondary sections with no usable meeting time: ${unscheduled.length} of ${secondaries.length} (${percent(unscheduled.length, secondaries.length)})`,
    tally(unscheduled, (section) => String(section.component))
  );

  console.log(
    "Secondary component combinations per class:",
    tally(classes, (group) =>
      [...new Set(group.secondaries.map((section) => section.component))]
        .sort()
        .join("+")
    )
  );

  // Components a student may not have to attend, where the whole component of
  // a class is voluntary or supplementary
  const optional = secondaries.filter((section) =>
    ["VOL", "SUP"].includes(section.component ?? "")
  );
  console.log(
    `Voluntary and supplementary sections: ${optional.length}, of which ${optional.filter((section) => getTimeKey(section, false) !== "").length} have a meeting time`,
    tally(optional, (section) => `${section.subject} ${section.courseNumber}`)
  );

  console.log(
    "Section status:",
    tally(sections, (section) => String(section.status))
  );
};

const reportTimes = (sections: Section[]) => {
  const meetings = sections.flatMap((section) => section.meetings ?? []);
  const timed = meetings.filter(
    (meeting) => meeting.startTime && meeting.endTime
  );

  heading("Stored meeting times");
  console.log({
    meetings: meetings.length,
    withoutTimes: meetings.length - timed.length,
    startingAtMidnight: timed.filter(
      (meeting) => toMinutes(meeting.startTime!) === 0
    ).length,
    withoutDays: timed.filter((meeting) => !meeting.days?.some(Boolean)).length,
    shorterThanMinimum: timed.filter(
      (meeting) =>
        toMinutes(meeting.endTime!) - toMinutes(meeting.startTime!) <
        MIN_MEETING_MINUTES
    ).length,
  });

  const real = timed.filter(isScheduled);
  const minute = (time: string) => `:${time.split(":")[1]}`;

  console.log(
    "Time string lengths:",
    tally(timed, (meeting) => String(meeting.endTime!.length))
  );
  console.log(
    "End minute of real meetings:",
    tally(real, (meeting) => minute(meeting.endTime!))
  );
  console.log(
    "Start minute of real meetings:",
    tally(real, (meeting) => minute(meeting.startTime!))
  );
};

const reportEnrollment = async (
  db: mongoose.mongo.Db,
  term: { year: number; semester: string }
) => {
  const latest = await db
    .collection("enrollmenthistories")
    .aggregate<{ last?: { endTime?: Date; granularitySeconds?: number } }>([
      { $match: term },
      { $project: { last: { $arrayElemAt: ["$history", -1] } } },
    ])
    .toArray();

  heading("Enrollment data freshness");

  const observed = latest.filter((entry) => entry.last?.endTime);

  if (observed.length === 0) {
    console.log("No enrollment history for this term in this database.");
    return;
  }

  const newest = Math.max(
    ...observed.map((entry) => entry.last!.endTime!.getTime())
  );
  const lagHours = observed.map(
    (entry) => (newest - entry.last!.endTime!.getTime()) / 3_600_000
  );

  console.log({
    sectionsWithHistory: observed.length,
    newestSnapshot: new Date(newest).toISOString(),
    newestSnapshotAgeInDays: ((Date.now() - newest) / 86_400_000).toFixed(1),
    pollIntervalSeconds: tally(observed, (entry) =>
      String(entry.last!.granularitySeconds)
    ),
  });
  // A snapshot is extended while a section's numbers stay the same, so a
  // large lag can mean either stale data or a section that stopped being polled
  console.log(
    "Hours each section's last snapshot trails the newest one:",
    describe(lagHours.map((hours) => Math.round(hours * 10) / 10))
  );
};

const reportTracking = async (db: mongoose.mongo.Db) => {
  const events = await db
    .collection("trackingevents")
    .find(
      {
        eventType: {
          $in: ["schedule_generate", "schedule_generate_succeeded"],
        },
      },
      {
        projection: {
          eventType: 1,
          targetId: 1,
          sessionId: 1,
          metadata: 1,
          timestamp: 1,
        },
      }
    )
    .toArray();

  heading("Generate usage (trackingevents)");

  if (events.length === 0) {
    console.log(
      "No schedule_generate events in this database. Run against production to get the baseline."
    );
    return;
  }

  const clicks = events.filter(
    (event) => event.eventType === "schedule_generate"
  );
  const successes = events.filter(
    (event) => event.eventType === "schedule_generate_succeeded"
  );
  const timestamps = events.map((event) => new Date(event.timestamp).getTime());

  // Clicks are logged per click and successes once per dialog open, so they
  // are only comparable per browsing session and schedule
  const sessionKey = (event: (typeof events)[number]) =>
    `${event.sessionId}|${event.targetId}`;
  const clicked = new Set(clicks.map(sessionKey));
  const succeeded = new Set(successes.map(sessionKey));
  const failed = [...clicked].filter((key) => !succeeded.has(key)).length;

  console.log({
    from: new Date(Math.min(...timestamps)).toISOString(),
    to: new Date(Math.max(...timestamps)).toISOString(),
    clicks: clicks.length,
    successes: successes.length,
    sessionsWithClick: clicked.size,
    sessionsWithoutAnyResult: `${failed} (${percent(failed, clicked.size)})`,
    successesTruncated: `${successes.filter((event) => event.metadata?.truncated).length} (${percent(successes.filter((event) => event.metadata?.truncated).length, successes.length)})`,
    legacyTooManyCombinations: clicks.filter(
      (event) => event.metadata?.tooManyCombinations
    ).length,
  });
  console.log(
    "Classes per successful generation:",
    tally(successes, (event) => String(event.metadata?.classCount))
  );
  console.log(
    "Schedules produced per successful generation:",
    describe(
      successes
        .map((event) => Number(event.metadata?.generatedCount))
        .filter(Number.isFinite)
    )
  );
};

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;

  const term = await resolveTerm(db);
  console.log(`Measuring ${term.year} ${term.semester}`);

  const sections = await db
    .collection("sections")
    .find<Section>(term, {
      projection: {
        sectionId: 1,
        sessionId: 1,
        subject: 1,
        courseNumber: 1,
        number: 1,
        primary: 1,
        component: 1,
        type: 1,
        graded: 1,
        status: 1,
        associatedSectionIds: 1,
        associatedClass: 1,
        meetings: 1,
      },
    })
    .toArray();

  const classes = reportClasses(sections);
  reportComponents(sections, classes);
  reportTimes(sections);
  await reportEnrollment(db, term);
  await reportTracking(db);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
