import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Download } from "iconoir-react";

import {
  Button,
  Checkbox,
  ColoredSquare,
  DaySelect,
  Dialog,
  Flex,
  Select,
} from "@repo/theme";

import ScheduleSummary from "@/components/ScheduleSummary";
import { useUpdateSchedule } from "@/hooks/api";
import { useTracking } from "@/hooks/api/tracking/useTracking";
import { ISchedule, componentMap } from "@/lib/api";
import { IScheduleListSchedule } from "@/lib/api/schedules";
import { Component } from "@/lib/generated/graphql";
import {
  GeneratedSchedule,
  Reason,
  Rule,
  generateSchedules,
  turnOff,
} from "@/lib/scheduler";
import { applyGeneratedSelection } from "@/lib/scheduler/apply";
import {
  GeneratorPreferences,
  SortKey,
  loadPreferences,
  savePreferences,
  toMondayFirst,
  toSundayFirst,
} from "@/lib/scheduler/preferences";
import { formatMinutes } from "@/lib/scheduler/time";

import { downloadBlob, renderScheduleImage } from "../renderScheduleImage";
import styles from "./GenerateSchedulesDialog.module.scss";

interface GenerateSchedulesDialogProps {
  schedule: ISchedule;
  children: React.ReactNode;
  onSelect?: () => void;
}

const PAGE_SIZE = 8;

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const toHourOptions = (hours: number[]) =>
  hours.map((hour) => ({ value: hour * 60, label: formatMinutes(hour * 60) }));

const startOptions = toHourOptions([8, 9, 10, 11, 12]);
const endOptions = toHourOptions([14, 15, 16, 17, 18, 19]);

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "fewest-gaps", label: "Fewest gaps between classes" },
  { value: "fewest-days", label: "Fewest days on campus" },
  { value: "latest-start", label: "Latest start" },
  { value: "earliest-finish", label: "Earliest finish" },
];

const plural = (count: number, word: string) =>
  `${count.toLocaleString()} ${count === 1 ? word : `${word}s`}`;

const formatGaps = (minutes: number) => {
  if (minutes === 0) return "no gaps";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts = [hours > 0 && `${hours} hr`, rest > 0 && `${rest} min`];
  return `${parts.filter(Boolean).join(" ")} of gaps`;
};

const summarize = (generated: GeneratedSchedule) =>
  [
    plural(generated.daysOnCampus, "day"),
    formatGaps(generated.gapMinutes),
    generated.firstStart !== null &&
      generated.lastEnd !== null &&
      `${formatMinutes(generated.firstStart)}–${formatMinutes(generated.lastEnd)}`,
    generated.closedSections > 0 &&
      `${plural(generated.closedSections, "closed section")}`,
    generated.unannouncedSections > 0 &&
      `${plural(generated.unannouncedSections, "section")} without a set time`,
  ]
    .filter(Boolean)
    .join(" · ");

/** "Monday", "Monday and Friday", "Monday, Wednesday and Friday". */
const listDays = (days: boolean[]) => {
  const names = days.flatMap((on, day) => (on ? [DAY_NAMES[day]] : []));
  if (names.length === DAY_NAMES.length) return "any day";
  return names.length > 1
    ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
    : names[0];
};

const describeRelaxation = (rule: Rule, preferences: GeneratorPreferences) =>
  rule === "earliestStart"
    ? `Allow classes before ${formatMinutes(preferences.earliestStart ?? 0)}`
    : rule === "latestEnd"
      ? `Allow classes after ${formatMinutes(preferences.latestEnd ?? 0)}`
      : rule === "avoidDays"
        ? `Allow classes on ${listDays(preferences.avoidDays)}`
        : "Include closed sections";

export default function GenerateSchedulesDialog({
  schedule,
  children,
  onSelect,
}: GenerateSchedulesDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"preferences" | "results" | "applied">(
    "preferences"
  );
  // Snapshot of the applied schedule, shown once a generated one is selected
  const [preview, setPreview] = useState<{
    canvas: HTMLCanvasElement;
    url: string;
  } | null>(null);
  const [preferences, setPreferences] =
    useState<GeneratorPreferences>(loadPreferences);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeScheduleIndex, setActiveScheduleIndex] = useState<number | null>(
    null
  );
  const [updateSchedule] = useUpdateSchedule();
  const { trackEvent } = useTracking();

  // Guards schedule_generate so it fires once per time the dialog is opened,
  // not on every recomputation of the results.
  const trackedOpenRef = useRef(false);

  // Hidden classes and events are left out of generation, as before.
  const classes = useMemo(
    () => schedule.classes.filter((c) => !c.hidden),
    [schedule.classes]
  );

  const events = useMemo(
    () => schedule.events.filter((e) => !e.hidden),
    [schedule.events]
  );

  const generating = open && step === "results" && classes.length > 0;

  // A few milliseconds on realistic schedules, and bounded by a time budget,
  // so it runs on the main thread (README.md in lib/scheduler).
  const generation = useMemo(() => {
    if (!generating) return null;

    try {
      return generateSchedules(classes, events, preferences, {
        count: visibleCount,
      });
    } catch {
      return null;
    }
  }, [generating, classes, events, preferences, visibleCount]);

  const generatedSchedules = useMemo(
    () =>
      generation?.schedules.map(
        (generated): IScheduleListSchedule => ({
          _id: schedule._id,
          name: schedule.name,
          year: schedule.year,
          semester: schedule.semester,
          sessionId: schedule.sessionId,
          events: schedule.events,
          classes: generated.classes.map(({ classIndex, sectionIds }) => ({
            class: classes[classIndex].class,
            selectedSections: sectionIds.map((sectionId) => ({ sectionId })),
            color: classes[classIndex].color,
          })),
        })
      ) ?? [],
    [generation, schedule, classes]
  );

  // Record one generation per dialog session, once results are computed
  useEffect(() => {
    if (!open) {
      trackedOpenRef.current = false;
      return;
    }

    if (trackedOpenRef.current || !generation) return;

    trackedOpenRef.current = true;

    trackEvent("schedule_generate", "schedule", schedule._id, {
      classCount: classes.length,
      generatedCount: generation.schedules.length,
      stoppedEarly: generation.stoppedEarly,
      elapsedMs: Math.round(generation.stats.elapsedMs),
      nodes: generation.stats.nodes,
      sortBy: preferences.sortBy,
      earliestStart: preferences.earliestStart,
      latestEnd: preferences.latestEnd,
      avoidDayCount: preferences.avoidDays.filter(Boolean).length,
      onlyOpenSections: preferences.onlyOpenSections,
    });
  }, [open, generation, classes, preferences, schedule._id, trackEvent]);

  const openDialog = () => {
    setPreferences(loadPreferences());
    setStep("preferences");
    setVisibleCount(PAGE_SIZE);
    setActiveScheduleIndex(null);
    setPreview(null);
    setOpen(true);
  };

  const updatePreferences = (update: Partial<GeneratorPreferences>) =>
    setPreferences((current) => ({ ...current, ...update }));

  const showResults = () => {
    savePreferences(preferences);
    setVisibleCount(PAGE_SIZE);
    setActiveScheduleIndex(null);
    setStep("results");
  };

  const relax = (rule: Rule) => {
    const next = turnOff(rule, preferences);
    setPreferences(next);
    savePreferences(next);
    setVisibleCount(PAGE_SIZE);
    setActiveScheduleIndex(null);
  };

  const describeReason = (reason: Reason) => {
    const name = (index: number) =>
      `${classes[index].class.subject} ${classes[index].class.courseNumber}`;
    const label = (component: string) =>
      componentMap[component as Component] ?? component;

    // "Lecture of COMPSCI 61A", for a section the student locked.
    const ofClass = (reason: { classIndex: number; component: string }) =>
      `${label(reason.component)} of ${name(reason.classIndex)}`;

    switch (reason.kind) {
      case "closed":
        return reason.locked
          ? `Your locked ${ofClass(reason)} is closed.`
          : `Every ${label(reason.component)} section of ${name(reason.classIndex)} is closed.`;
      case "hours":
        return reason.locked
          ? `Your locked ${ofClass(reason)} is outside your class hours.`
          : `No ${label(reason.component)} section of ${name(reason.classIndex)} fits your class hours.`;
      case "days":
        return reason.locked
          ? `Your locked ${ofClass(reason)} meets on a day you keep free.`
          : `Every ${label(reason.component)} section of ${name(reason.classIndex)} meets on a day you keep free.`;
      case "events":
        return reason.locked
          ? `Your locked ${ofClass(reason)} overlaps one of your events.`
          : `No ${label(reason.component)} section of ${name(reason.classIndex)} fits around your events.`;
      case "class":
        return `No combination of ${name(reason.classIndex)}'s own sections fits together.`;
      case "pair":
        return `${name(reason.classIndexes[0])} and ${name(reason.classIndexes[1])} always overlap.`;
      case "all":
        return "Couldn't find a combination that fits all of your classes at once. Try hiding one of them.";
    }
  };

  const handleSelectSchedule = useCallback(() => {
    const selected =
      activeScheduleIndex === null
        ? undefined
        : generation?.schedules[activeScheduleIndex];

    if (!selected) return;

    // Change only the selected sections of generated classes, so hidden
    // classes and every lock and excluded section survive.
    const nextClasses = applyGeneratedSelection(
      schedule.classes,
      selected.classes.map(({ classIndex, sectionIds }) => ({
        subject: classes[classIndex].class.subject,
        courseNumber: classes[classIndex].class.courseNumber,
        number: classes[classIndex].class.number,
        sectionIds,
      }))
    );

    updateSchedule(
      schedule._id,
      {
        classes: nextClasses.map(
          ({
            selectedSections,
            class: { number, subject, courseNumber },
            color,
            hidden,
            locked,
            blockedSections,
            lockedComponents,
          }) => ({
            subject,
            courseNumber,
            number,
            sectionIds: selectedSections.map((s) => s.sectionId),
            color,
            hidden,
            locked,
            blockedSections,
            lockedComponents,
          })
        ),
      },
      {
        optimisticResponse: {
          updateSchedule: { ...schedule, classes: nextClasses },
        },
      }
    );

    const canvas = renderScheduleImage({ ...schedule, classes: nextClasses });
    setPreview({ canvas, url: canvas.toDataURL("image/png") });
    setStep("applied");
    setActiveScheduleIndex(null);
    onSelect?.();
  }, [
    activeScheduleIndex,
    generation,
    classes,
    schedule,
    updateSchedule,
    onSelect,
  ]);

  const fileName = useMemo(
    () =>
      schedule.name
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "schedule",
    [schedule.name]
  );

  const handleDownloadPng = useCallback(() => {
    preview?.canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${fileName}.png`);
    }, "image/png");
  }, [preview, fileName]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Overlay />
      <Dialog.Card className={styles.card}>
        <Dialog.Header
          title={
            step === "preferences"
              ? "Schedule preferences"
              : step === "results"
                ? "Generated Schedules"
                : "Schedule applied"
          }
          hasCloseButton
        />
        <Dialog.Body className={styles.body}>
          {step === "applied" ? (
            preview && (
              <div className={styles.preview}>
                <img
                  src={preview.url}
                  alt={`${schedule.name} weekly schedule`}
                />
              </div>
            )
          ) : step === "preferences" ? (
            <div className={styles.preferences}>
              <div className={styles.field}>
                <p className={styles.label}>No classes before</p>
                <Select
                  value={preferences.earliestStart}
                  placeholder="Any time"
                  clearable
                  onChange={(value) =>
                    updatePreferences({
                      earliestStart: Array.isArray(value) ? value[0] : value,
                    })
                  }
                  options={startOptions}
                />
              </div>
              <div className={styles.field}>
                <p className={styles.label}>No classes after</p>
                <Select
                  value={preferences.latestEnd}
                  placeholder="Any time"
                  clearable
                  onChange={(value) =>
                    updatePreferences({
                      latestEnd: Array.isArray(value) ? value[0] : value,
                    })
                  }
                  options={endOptions}
                />
              </div>
              <div className={styles.field}>
                <p className={styles.label}>Keep these days free</p>
                <DaySelect
                  size="sm"
                  days={toSundayFirst(preferences.avoidDays)}
                  updateDays={(days) =>
                    updatePreferences({ avoidDays: toMondayFirst(days) })
                  }
                />
              </div>
              <div className={styles.field}>
                <label className={styles.option}>
                  <Checkbox
                    checked={preferences.onlyOpenSections}
                    onCheckedChange={(checked) =>
                      updatePreferences({ onlyOpenSections: checked === true })
                    }
                  />
                  Only use open sections
                </label>
                <p className={styles.hint}>
                  These are rules: schedules that break them are left out, even
                  ones that use your locked sections.
                </p>
              </div>
              <div className={styles.field}>
                <p className={styles.label}>Sort by</p>
                <Select
                  value={preferences.sortBy}
                  onChange={(value) => {
                    const sortBy = Array.isArray(value) ? value[0] : value;
                    if (sortBy) updatePreferences({ sortBy });
                  }}
                  options={sortOptions}
                />
              </div>
            </div>
          ) : (
            <Flex
              direction="column"
              gap="4"
              width="100%"
              className={styles.container}
            >
              <Flex
                direction="column"
                gap="2"
                width="100%"
                className={styles.headerSection}
              >
                <Flex
                  direction="row"
                  gap="2"
                  wrap="wrap"
                  className={styles.selectedClasses}
                >
                  {classes.map((selectedClass) => {
                    const courseName = `${selectedClass.class.subject} ${selectedClass.class.courseNumber}`;
                    return (
                      <Flex
                        direction="row"
                        gap="2"
                        align="center"
                        key={courseName}
                      >
                        <ColoredSquare
                          color={`var(--${selectedClass.color}-500)`}
                        />
                        <span>{courseName}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <h3 className={styles.tip}>
                  Tip: Lock/Hide courses in schedule to control which schedules
                  are generated.
                </h3>
                {generation?.stoppedEarly && (
                  <p className={styles.hint}>
                    The search ran out of time, so it may have missed better
                    schedules. Lock or hide a class to narrow it down.
                  </p>
                )}
              </Flex>

              <div className={styles.scrollableContent}>
                {generatedSchedules.length > 0 && generation ? (
                  <>
                    <div className={styles.grid}>
                      {generatedSchedules.map((generatedSchedule, index) => (
                        <div
                          key={index}
                          onClick={() => setActiveScheduleIndex(index)}
                          className={`${styles.scheduleCard} ${activeScheduleIndex === index ? styles.selected : ""}`}
                        >
                          <ScheduleSummary schedule={generatedSchedule} />
                          <p className={styles.caption}>
                            {summarize(generation.schedules[index])}
                          </p>
                        </div>
                      ))}
                    </div>
                    {generation.schedules.length === visibleCount && (
                      <Flex justify="center">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            setVisibleCount((count) => count + PAGE_SIZE)
                          }
                        >
                          Show more
                        </Button>
                      </Flex>
                    )}
                  </>
                ) : (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    className={styles.emptyState}
                  >
                    <p>No valid schedule combinations found.</p>
                    {classes.length === 0 ? (
                      <p className={styles.emptyStateMessage}>
                        Select at least one course to generate schedules.
                      </p>
                    ) : generating && !generation ? (
                      <p className={styles.emptyStateMessage}>
                        Something went wrong while generating schedules. Try
                        again.
                      </p>
                    ) : (
                      generation?.reasons.map((reason, index) => (
                        <p key={index} className={styles.emptyStateMessage}>
                          {describeReason(reason)}
                        </p>
                      ))
                    )}
                    {generation && generation.relaxations.length > 0 && (
                      <Flex
                        direction="column"
                        align="center"
                        gap="2"
                        className={styles.relaxations}
                      >
                        {generation.relaxations.map((rule) => (
                          <Button
                            key={rule}
                            variant="secondary"
                            onClick={() => relax(rule)}
                          >
                            {describeRelaxation(rule, preferences)}
                          </Button>
                        ))}
                      </Flex>
                    )}
                  </Flex>
                )}
              </div>
            </Flex>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          {step === "applied" ? (
            <>
              <Button variant="secondary" onClick={handleDownloadPng}>
                <Download />
                Download PNG
              </Button>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </>
          ) : step === "preferences" ? (
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={showResults}>Show schedules</Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setStep("preferences")}
              >
                Edit preferences
              </Button>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSelectSchedule}
                disabled={activeScheduleIndex === null}
              >
                Select Schedule
              </Button>
            </>
          )}
        </Dialog.Footer>
      </Dialog.Card>
      <div onClick={openDialog}>{children}</div>
    </Dialog.Root>
  );
}
