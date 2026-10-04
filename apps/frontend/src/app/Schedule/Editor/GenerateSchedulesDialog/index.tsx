import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { ISchedule, IScheduleClass, componentMap } from "@/lib/api";
import { IScheduleListSchedule } from "@/lib/api/schedules";
import { Component } from "@/lib/generated/graphql";
import { applyGeneratedSelection } from "@/lib/scheduler/apply";
import {
  GeneratedSchedule,
  Reason,
  generateSchedules,
} from "@/lib/scheduler/generate";
import {
  GeneratorPreferences,
  loadPreferences,
  savePreferences,
  toMondayFirst,
  toSundayFirst,
} from "@/lib/scheduler/preferences";

import styles from "./GenerateSchedulesDialog.module.scss";

interface GenerateSchedulesDialogProps {
  schedule: ISchedule;
  children: React.ReactNode;
}

const PAGE_SIZE = 8;

const formatHour = (minutes: number) => {
  const hours = minutes / 60;
  return `${hours % 12 || 12} ${hours < 12 ? "AM" : "PM"}`;
};

const toHourOptions = (hours: number[]) =>
  hours.map((hour) => ({ value: hour * 60, label: formatHour(hour * 60) }));

const startOptions = toHourOptions([8, 9, 10, 11, 12]);
const endOptions = toHourOptions([14, 15, 16, 17, 18, 19]);

const formatGaps = (minutes: number) => {
  // Berkeley lists a class that ends at 12:00 as ending at 11:59, so round.
  const rounded = Math.round(minutes / 10) * 10;
  if (rounded === 0) return "no gaps";
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  const parts = [hours > 0 && `${hours} hr`, rest > 0 && `${rest} min`];
  return `${parts.filter(Boolean).join(" ")} of gaps`;
};

const summarize = (generated: GeneratedSchedule<IScheduleClass>) =>
  [
    `${generated.daysOnCampus} ${generated.daysOnCampus === 1 ? "day" : "days"}`,
    formatGaps(generated.gapMinutes),
    generated.closedSections > 0 &&
      `${generated.closedSections} closed ${generated.closedSections === 1 ? "section" : "sections"}`,
  ]
    .filter(Boolean)
    .join(" · ");

export default function GenerateSchedulesDialog({
  schedule,
  children,
}: GenerateSchedulesDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"preferences" | "results">("preferences");
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

  const generation = useMemo(() => {
    if (!open || step !== "results" || classes.length === 0) return null;

    return generateSchedules(classes, events, preferences, {
      count: visibleCount,
    });
  }, [open, step, classes, events, preferences, visibleCount]);

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
          classes: generated.classes.map(({ scheduleClass, sectionIds }) => ({
            class: scheduleClass.class,
            selectedSections: sectionIds.map((sectionId) => ({ sectionId })),
            color: scheduleClass.color,
          })),
        })
      ) ?? [],
    [generation, schedule]
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
      complete: generation.complete,
      earliestStart: preferences.earliestStart,
      latestEnd: preferences.latestEnd,
      avoidDayCount: preferences.avoidDays.filter(Boolean).length,
      fewerDays: preferences.fewerDays,
      fewerGaps: preferences.fewerGaps,
      onlyOpenSections: preferences.onlyOpenSections,
    });
  }, [open, generation, classes, preferences, schedule._id, trackEvent]);

  const openDialog = () => {
    setPreferences(loadPreferences());
    setStep("preferences");
    setVisibleCount(PAGE_SIZE);
    setActiveScheduleIndex(null);
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

  const describeReason = (reason: Reason) => {
    const name = (index: number) =>
      `${classes[index].class.subject} ${classes[index].class.courseNumber}`;

    switch (reason.kind) {
      case "closed":
        return `Every ${componentMap[reason.component as Component] ?? reason.component} section of ${name(reason.classIndex)} is closed. Turn off "Only use open sections" or lock a section.`;
      case "events":
        return `No ${componentMap[reason.component as Component] ?? reason.component} section of ${name(reason.classIndex)} fits around your events.`;
      case "class":
        return `No combination of ${name(reason.classIndex)}'s own sections fits together.`;
      case "pair":
        return `${name(reason.classIndexes[0])} and ${name(reason.classIndexes[1])} always overlap.`;
      case "all":
        return "No combination fits all of your classes at once. Try hiding one of them.";
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
      selected.classes.map(({ scheduleClass, sectionIds }) => ({
        subject: scheduleClass.class.subject,
        courseNumber: scheduleClass.class.courseNumber,
        number: scheduleClass.class.number,
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

    setOpen(false);
    setActiveScheduleIndex(null);
  }, [activeScheduleIndex, generation, schedule, updateSchedule]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Overlay />
      <Dialog.Card className={styles.card}>
        <Dialog.Header
          title={
            step === "preferences"
              ? "Schedule preferences"
              : "Generated Schedules"
          }
          hasCloseButton
        />
        <Dialog.Body className={styles.body}>
          {step === "preferences" ? (
            <div className={styles.preferences}>
              <div className={styles.field}>
                <p className={styles.label}>Start no earlier than</p>
                <Select
                  value={preferences.earliestStart}
                  placeholder="No preference"
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
                <p className={styles.label}>End no later than</p>
                <Select
                  value={preferences.latestEnd}
                  placeholder="No preference"
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
                <p className={styles.label}>Also prefer</p>
                <label className={styles.option}>
                  <Checkbox
                    checked={preferences.fewerDays}
                    onCheckedChange={(checked) =>
                      updatePreferences({ fewerDays: checked === true })
                    }
                  />
                  Fewer days on campus
                </label>
                <label className={styles.option}>
                  <Checkbox
                    checked={preferences.fewerGaps}
                    onCheckedChange={(checked) =>
                      updatePreferences({ fewerGaps: checked === true })
                    }
                  />
                  Fewer gaps between classes
                </label>
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
                  Preferences rank schedules. Only this option removes sections,
                  and it never removes locked ones.
                </p>
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
                {generation && !generation.complete && (
                  <p className={styles.hint}>
                    The search stopped early, so these may not be the best
                    possible schedules.
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
                    ) : generation && generation.reasons.length > 0 ? (
                      generation.reasons.map((reason, index) => (
                        <p key={index} className={styles.emptyStateMessage}>
                          {describeReason(reason)}
                        </p>
                      ))
                    ) : (
                      <p className={styles.emptyStateMessage}>
                        The search ran out of time. Lock or hide a class and try
                        again.
                      </p>
                    )}
                  </Flex>
                )}
              </div>
            </Flex>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          {step === "preferences" ? (
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
