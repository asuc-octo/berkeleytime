import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, ColoredSquare, Dialog, Flex } from "@repo/theme";

import ScheduleSummary from "@/components/ScheduleSummary";
import { useUpdateSchedule } from "@/hooks/api";
import { useTracking } from "@/hooks/api/tracking/useTracking";
import { ISchedule, IScheduleClass } from "@/lib/api";
import { IScheduleListSchedule } from "@/lib/api/schedules";

import styles from "./GenerateSchedulesDialog.module.scss";
import { MAX_GENERATED_SCHEDULES, generateSchedules } from "./generate";

interface GenerateSchedulesDialogProps {
  schedule: ISchedule;
  children: React.ReactNode;
}

export default function GenerateSchedulesDialog({
  schedule,
  children,
}: GenerateSchedulesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<IScheduleClass[]>([]);
  const [activeScheduleIndex, setActiveScheduleIndex] = useState<number | null>(
    null
  );
  const [updateSchedule] = useUpdateSchedule();
  const { trackEvent } = useTracking();

  // Guards schedule_generate_succeeded so it fires once per time the dialog is
  // opened, not on every recomputation of the combinations.
  const trackedOpenRef = useRef(false);

  // Initialize selected classes from schedule when dialog opens
  useEffect(() => {
    if (open) {
      const nonHiddenClasses = schedule.classes.filter((c) => !c.hidden);
      setSelectedClasses(nonHiddenClasses);
    }
  }, [open, schedule.classes]);

  // Sync selected classes with schedule changes (when classes are added/removed or properties change)
  useEffect(() => {
    if (open) {
      setSelectedClasses((prevSelectedClasses) => {
        // Update selected classes to match current schedule
        // Update existing classes with latest data (including lockedComponents, blockedSections, etc.)
        const updatedSelectedClasses = prevSelectedClasses
          .map((selectedClass) => {
            const scheduleClass = schedule.classes.find(
              (c) =>
                c.class.subject === selectedClass.class.subject &&
                c.class.courseNumber === selectedClass.class.courseNumber &&
                c.class.number === selectedClass.class.number
            );
            // If class still exists, return updated version from schedule
            return scheduleClass || selectedClass;
          })
          .filter(
            (selectedClass) =>
              // Remove classes that no longer exist or are now hidden
              schedule.classes.some(
                (c) =>
                  c.class.subject === selectedClass.class.subject &&
                  c.class.courseNumber === selectedClass.class.courseNumber &&
                  c.class.number === selectedClass.class.number
              ) && !selectedClass.hidden
          );

        // Add new classes that are not hidden
        const newClasses = schedule.classes.filter(
          (c) =>
            !c.hidden &&
            !updatedSelectedClasses.some(
              (sc) =>
                sc.class.subject === c.class.subject &&
                sc.class.courseNumber === c.class.courseNumber &&
                sc.class.number === c.class.number
            )
        );

        return [...updatedSelectedClasses, ...newClasses];
      });
    }
  }, [schedule.classes, open]);

  // Generate all valid schedule combinations
  const generation = useMemo(
    () =>
      generateSchedules(
        selectedClasses,
        schedule.events.filter((e) => !e.hidden)
      ),
    [selectedClasses, schedule.events]
  );

  // Convert combinations to IScheduleListSchedule format for ScheduleSummary
  const generatedSchedules = useMemo(
    () =>
      generation.schedules.map((combination) => {
        const scheduleData: IScheduleListSchedule = {
          _id: schedule._id,
          name: schedule.name,
          year: schedule.year,
          semester: schedule.semester,
          sessionId: schedule.sessionId,
          events: schedule.events,
          classes: combination.map((sectionIds, index) => ({
            class: selectedClasses[index].class,
            selectedSections: sectionIds.map((sectionId) => ({ sectionId })),
            color: selectedClasses[index].color,
          })),
        };

        return scheduleData;
      }),
    [generation, selectedClasses, schedule]
  );

  // Record at most one successful generation per dialog session. Clicks are
  // recorded separately (schedule_generate) so the two can be compared.
  useEffect(() => {
    if (!open) {
      trackedOpenRef.current = false;
      return;
    }

    if (trackedOpenRef.current) return;

    // selectedClasses lags schedule.classes by a render after opening, so wait
    // until they match rather than reporting the previous session's result
    const visibleClasses = schedule.classes.filter((c) => !c.hidden);
    const settled =
      visibleClasses.length === selectedClasses.length &&
      visibleClasses.every((c, index) => c === selectedClasses[index]);

    if (!settled) return;

    trackedOpenRef.current = true;

    if (generation.schedules.length === 0) return;

    trackEvent("schedule_generate_succeeded", "schedule", schedule._id, {
      classCount: selectedClasses.length,
      generatedCount: generation.schedules.length,
      truncated: generation.truncated,
    });
  }, [
    open,
    selectedClasses,
    generation,
    schedule.classes,
    schedule._id,
    trackEvent,
  ]);

  const handleOpen = useCallback(() => {
    // One event per click on the Generate button, whatever the outcome
    trackEvent("schedule_generate", "schedule", schedule._id);
    setOpen(true);
  }, [schedule._id, trackEvent]);

  const handleSelectSchedule = useCallback(() => {
    if (activeScheduleIndex === null) return;

    const selectedSchedule = generation.schedules[activeScheduleIndex];

    if (!selectedSchedule) return;

    // Update the schedule with the selected combination, leaving classes that
    // were not part of the generation (e.g. hidden ones) untouched
    updateSchedule(
      schedule._id,
      {
        classes: schedule.classes.map(
          ({
            selectedSections,
            class: { number, subject, courseNumber },
            color,
            hidden,
            locked,
            blockedSections,
            lockedComponents,
          }) => {
            const index = selectedClasses.findIndex(
              (c) =>
                c.class.subject === subject &&
                c.class.courseNumber === courseNumber &&
                c.class.number === number
            );

            return {
              subject,
              courseNumber,
              number,
              sectionIds:
                index === -1
                  ? selectedSections.map((s) => s.sectionId)
                  : selectedSchedule[index],
              color,
              hidden,
              locked,
              blockedSections,
              lockedComponents,
            };
          }
        ),
      },
      {
        optimisticResponse: {
          updateSchedule: schedule,
        },
      }
    );

    setOpen(false);
    setActiveScheduleIndex(null);
  }, [
    activeScheduleIndex,
    generation,
    selectedClasses,
    schedule,
    updateSchedule,
  ]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Overlay />
      <Dialog.Card className={styles.card}>
        <Dialog.Header title="Generated Schedules" hasCloseButton />
        <Dialog.Body className={styles.body}>
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
                {selectedClasses.map((selectedClass) => {
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
            </Flex>

            <div className={styles.scrollableContent}>
              {generation.unscheduled.length > 0 && (
                <p className={styles.note}>
                  No times are posted yet for{" "}
                  {generation.unscheduled.join(", ")}. These sections are left
                  as they are and not checked for conflicts.
                </p>
              )}
              {generation.truncated && (
                <p className={styles.note}>
                  Showing the first {MAX_GENERATED_SCHEDULES} schedules.
                  Lock/hide courses or sections to narrow them down.
                </p>
              )}
              {generatedSchedules.length > 0 ? (
                <div className={styles.grid}>
                  {generatedSchedules.map((generatedSchedule, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveScheduleIndex(index)}
                      className={`${styles.scheduleCard} ${activeScheduleIndex === index ? styles.selected : ""}`}
                    >
                      <ScheduleSummary schedule={generatedSchedule} />
                    </div>
                  ))}
                </div>
              ) : (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  className={styles.emptyState}
                >
                  <p>
                    {generation.exhausted
                      ? "Too many possible schedules. Please lock/hide some courses and/or labs/discussions to generate fewer schedules."
                      : "No valid schedule combinations found."}
                  </p>
                  {selectedClasses.length === 0 && (
                    <p className={styles.emptyStateMessage}>
                      Select at least one course to generate schedules.
                    </p>
                  )}
                  {generation.conflicts.map((conflict) => (
                    <p key={conflict} className={styles.emptyStateMessage}>
                      {conflict}
                    </p>
                  ))}
                </Flex>
              )}
            </div>
          </Flex>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSelectSchedule}
            disabled={activeScheduleIndex === null}
          >
            Select Schedule
          </Button>
        </Dialog.Footer>
      </Dialog.Card>
      <div onClick={handleOpen}>{children}</div>
    </Dialog.Root>
  );
}
