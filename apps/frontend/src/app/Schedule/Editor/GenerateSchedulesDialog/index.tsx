import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, ColoredSquare, Dialog, Flex } from "@repo/theme";

import ScheduleSummary from "@/components/ScheduleSummary";
import { useUpdateSchedule } from "@/hooks/api";
import { ISchedule, IScheduleClass } from "@/lib/api";
import {
  IScheduleEvent,
  IScheduleListClass,
  IScheduleListSchedule,
} from "@/lib/api/schedules";
import { Component } from "@/lib/generated/graphql";

import styles from "./GenerateSchedulesDialog.module.scss";

interface GenerateSchedulesDialogProps {
  schedule: ISchedule;
  children: React.ReactNode;
}

// Helper function to parse time string "HH:MM" to minutes since midnight
const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

interface ComponentIndex {
  component: Component | undefined;
  index: number;
}

/**
 * Generates all possible combinations (like permutations) of indices
 * where the value at each index i ranges from 0 up to limitArray[i] (exclusive).
 * * @param limitArray An array where limitArray[i] is the exclusive upper limit for the i-th position.
 * @returns An array of number arrays, where each inner array is a generated combination.
 */
function generatePermutations(
  limitArray: ComponentIndex[],
  blockedArray: ComponentIndex[],
  lockedArray: ComponentIndex[]
): ComponentIndex[][] {
  const results: ComponentIndex[][] = [];

  // Helper function for the recursive DFS
  function dfs(index: number, currentCombination: ComponentIndex[]) {
    // 1. Base Case: If we've processed all indices, save the combination
    if (index === limitArray.length) {
      results.push([...currentCombination]); // Push a copy of the combination
      return;
    }

    // The exclusive upper limit for the current index is limitArray[index] + 1
    // since your example [4, 2, 1] means 0...4, 0...2, 0...1 (inclusive ranges)
    // Wait, looking at your prompt again:
    // index 0 is in range 0...3 (4 possibilities) -> limitArray[0] = 4 is the count
    // index 1 is in range 0...2 (3 possibilities) -> limitArray[1] = 3 is the count
    // index 2 is in range 0...1 (2 possibilities) -> limitArray[2] = 2 is the count
    //
    // Assuming your input [4, 2, 1] means:
    // Position 0 has 4 values: {0, 1, 2, 3}
    // Position 1 has 2 values: {0, 1}
    // Position 2 has 1 value: {0}
    //
    // I will interpret the input L = [4, 2, 1] as the NUMBER OF POSSIBILITIES for each index.
    const locked = lockedArray.find(
      (ci) => limitArray[index].component === ci.component
    );

    const lowerLimit =
      (locked?.component ?? -1) === limitArray[index].component
        ? locked!.index
        : 0;
    const upperLimit =
      (locked?.component ?? -1) === limitArray[index].component
        ? locked!.index + 1
        : limitArray[index].index;

    let added = 0;
    // 2. Recursive Step: Iterate through all possible values for the current index
    for (let value = lowerLimit; value < upperLimit; value++) {
      if (
        blockedArray.find(
          (ci) =>
            ci.component === limitArray[index].component && ci.index === value
        )
      )
        continue;

      // Add the current value to the combination
      currentCombination.push({
        component: limitArray[index].component,
        index: value,
      });

      // Recurse to the next index
      dfs(index + 1, currentCombination);

      // Backtrack: Remove the last element to prepare for the next iteration
      // This is crucial for exploring other paths/values at the current index.
      currentCombination.pop();
      added++;
    }
    // edge case where everything was excluded, we still want this to function
    if (added === 0) {
      currentCombination.push({
        component: limitArray[index].component,
        index: -1,
      });
      dfs(index + 1, currentCombination);
      currentCombination.pop();
    }
  }

  // Start the DFS from the first index (0) with an empty combination
  dfs(0, []);

  return results;
}

const detectMeetingOverlap = (
  section1: IScheduleClass["class"]["primarySection"] | undefined,
  section2: IScheduleClass["class"]["primarySection"] | undefined,
  event?: IScheduleEvent
): boolean => {
  if (!section1 || (!section2 && !event)) return false;
  if (
    section1.meetings.length === 0 ||
    (section2 && section2.meetings.length === 0)
  )
    return false;
  for (const meeting1 of section1.meetings) {
    if (section2) {
      for (const meeting2 of section2.meetings) {
        // Check if meetings occur on the same day
        const sameDay = meeting1.days?.some(
          (day, index) => day && meeting2.days?.[index]
        );
        if (!sameDay) continue;

        // Both meetings must have valid times
        if (
          !meeting1.startTime ||
          !meeting1.endTime ||
          !meeting2.startTime ||
          !meeting2.endTime
        )
          continue;

        const start1 = parseTime(meeting1.startTime);
        const end1 = parseTime(meeting1.endTime);
        const start2 = parseTime(meeting2.startTime);
        const end2 = parseTime(meeting2.endTime);

        // Two time ranges overlap if: start1 < end2 AND start2 < end1
        // This covers all overlap cases: partial overlap, one containing the other, etc.
        if (start1 < end2 && start2 < end1) {
          return true;
        }
      }
    } else if (event) {
      // Check if meetings occur on the same day
      const sameDay = meeting1.days?.some(
        (day, index) => day && event.days?.[index]
      );
      if (!sameDay) continue;

      // Both meetings must have valid times
      if (
        !meeting1.startTime ||
        !meeting1.endTime ||
        !event.startTime ||
        !event.endTime
      )
        continue;

      const start1 = parseTime(meeting1.startTime);
      const end1 = parseTime(meeting1.endTime);
      const start2 = parseTime(event.startTime);
      const end2 = parseTime(event.endTime);

      // Two time ranges overlap if: start1 < end2 AND start2 < end1
      // This covers all overlap cases: partial overlap, one containing the other, etc.
      if (start1 < end2 && start2 < end1) {
        return true;
      }
    }
  }
  return false;
};

const validCombination = (
  classes: IScheduleClass[],
  events: IScheduleEvent[],
  current: ComponentIndex[][],
  newClass: ComponentIndex[],
  newClassIndex: number
): boolean => {
  for (const ci1 of newClass) {
    if (ci1.index === -1) continue;
    const section1 =
      ci1.index === classes[newClassIndex].class.sections.length
        ? classes[newClassIndex].class.primarySection
        : classes[newClassIndex].class.sections[ci1.index];
    for (let i = 0; i < current.length; i++) {
      for (const ci2 of current[i]) {
        const section2 =
          ci2.index === classes[i].class.sections.length
            ? classes[i].class.primarySection
            : classes[i].class.sections[ci2.index];
        if (detectMeetingOverlap(section1, section2)) {
          return false;
        }
      }
    }
    for (const event of events) {
      if (detectMeetingOverlap(section1, undefined, event)) {
        return false;
      }
    }
  }
  // detect self overlap
  for (const ci1 of newClass) {
    if (ci1.index === -1) continue;
    for (const ci2 of newClass) {
      if (ci2.index === -1) continue;
      if (ci1.index === ci2.index) continue;
      const section1 =
        ci1.index === classes[newClassIndex].class.sections.length
          ? classes[newClassIndex].class.primarySection
          : classes[newClassIndex].class.sections[ci1.index];
      const section2 =
        ci2.index === classes[newClassIndex].class.sections.length
          ? classes[newClassIndex].class.primarySection
          : classes[newClassIndex].class.sections[ci2.index];
      if (detectMeetingOverlap(section1, section2)) {
        return false;
      }
    }
  }
  return true;
};

// Generate all combinations of sections from selected classes
const generateCombinations = (
  selectedClasses: IScheduleClass[],
  selectedEvents: IScheduleEvent[]
): IScheduleListClass[][] | string => {
  if (selectedClasses.length === 0) return [];

  // expected max number of generated schedules
  const maxGeneratedSchedules = selectedClasses.reduce((acc, selectedClass) => {
    if (selectedClass.locked || selectedClass.hidden) return acc;
    const componentCounts = [
      selectedClass.class.primarySection,
      ...selectedClass.class.sections,
    ]
      .filter((s) => s && s.component)
      .reduce(
        (acc, s) => {
          if (
            selectedClass.blockedSections?.includes(s!.sectionId) ||
            selectedClass.lockedComponents?.includes(s!.component)
          )
            return acc;
          acc[s!.component] = (acc[s!.component] || 0) + 1;
          return acc;
        },
        {} as Record<Component, number>
      );
    return acc * Object.values(componentCounts).reduce((acc, c) => acc * c, 1);
  }, 1);

  if (maxGeneratedSchedules > 500)
    return "Too many possible schedules. Please lock/hide some courses and/or labs/discussions to generate fewer schedules.";

  const generate = (
    current: ComponentIndex[][],
    index: number
  ): Array<ComponentIndex[][]> => {
    if (index == selectedClasses.length) return [current];

    const allSections = [
      ...selectedClasses[index].class.sections,
      selectedClasses[index].class.primarySection,
    ];

    // map component index to index in allSections
    const componentArrays: Map<Component | undefined, number[]> =
      allSections.reduce((acc, curr, i) => {
        if (!curr || !curr.component) return acc;
        if (acc.get(curr.component)) {
          acc.get(curr.component)?.push(i);
        } else {
          acc.set(curr.component, [i]);
        }
        return acc;
      }, new Map<Component, number[]>());

    // map component to list of associated sections
    const byComponent: Map<Component, IScheduleClass["class"]["sections"]> =
      allSections.reduce((acc, section) => {
        if (!section?.component) return acc;
        if (acc.get(section.component)) {
          acc.get(section.component)?.push(section);
        } else {
          acc.set(section.component, [section]);
        }
        return acc;
      }, new Map<Component, IScheduleClass["class"]["sections"]>());

    // map component to number of sections
    const componentCounts = Array.from(byComponent.entries()).map(
      ([component, sections]) => {
        return {
          component,
          index: sections.length,
        };
      }
    );

    // generate all permutations of components
    const allCombinations = selectedClasses[index].locked
      ? // if a class is locked, we do not generate any permutations
        [
          selectedClasses[index].selectedSections.reduce((acc, sid) => {
            if (
              selectedClasses[index].class.primarySection?.sectionId ==
              sid.sectionId
            )
              return [
                ...acc,
                {
                  index: selectedClasses[index].class.sections.length,
                  component:
                    selectedClasses[index].class.primarySection?.component,
                },
              ];
            const sectionIndex = selectedClasses[
              index
            ].class.sections.findIndex((s) => s.sectionId === sid.sectionId);
            if (sectionIndex == -1) return acc;
            return [
              ...acc,
              {
                index: sectionIndex,
                component:
                  selectedClasses[index].class.sections[sectionIndex].component,
              },
            ];
          }, [] as ComponentIndex[]),
        ]
      : generatePermutations(
          componentCounts,
          selectedClasses[index].blockedSections
            ?.filter(
              (s) =>
                s !== undefined &&
                allSections.find((s1) => s1?.sectionId === s)?.component
            )
            .map((s) => ({
              component: allSections.find((s1) => s1?.sectionId === s)!
                .component,
              // find index of section in component
              index:
                byComponent
                  .get(
                    allSections.find((s1) => s1?.sectionId === s)!.component
                  )!
                  .findIndex((s1) => s1.sectionId === s) ?? -1,
            })) ?? [],
          selectedClasses[index].lockedComponents?.map((c) => ({
            component: c,
            // find index of section in component
            index:
              byComponent
                .get(c)
                ?.findIndex((s) =>
                  selectedClasses[index].selectedSections.some(
                    (sid) => sid.sectionId === s.sectionId
                  )
                ) ?? -1,
          })) ?? []
        );

    // now, get the true index of each section
    const adjCombinations = selectedClasses[index].locked
      ? allCombinations
      : allCombinations.map((combination) => {
          return combination.map((ci) => {
            if (ci.index === -1)
              return {
                component: ci.component,
                index: -1,
              };
            return {
              component: ci.component,
              index: componentArrays.get(ci.component)![ci.index],
            };
          });
        });

    // filter out combinations that have time conflicts
    const filtered = adjCombinations.filter((combination) => {
      return validCombination(
        selectedClasses,
        selectedEvents,
        current,
        combination,
        index
      );
    });
    // recurse
    return filtered
      .map((c) => [...current, c])
      .map((c) => {
        return [...generate(c, index + 1)];
      })
      .flat();
  };

  const combinations = generate([], 0);
  return combinations.map((c) => {
    return c.map((cis, index) => {
      return {
        class: selectedClasses[index].class,
        selectedSections: cis
          .filter((ci) => ci.index !== -1)
          .map((ci) => {
            return {
              sectionId:
                ci.index === selectedClasses[index].class.sections.length
                  ? selectedClasses[index].class.primarySection?.sectionId
                  : selectedClasses[index].class.sections[ci.index]?.sectionId,
            };
          }),
        color: selectedClasses[index].color,
      };
    });
  });
};

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
  const generatedSchedules = useMemo(() => {
    if (selectedClasses.length === 0) return [];

    const combinations = generateCombinations(
      selectedClasses,
      schedule.events.filter((e) => !e.hidden)
    );

    if (typeof combinations === "string") return combinations;

    // Convert combinations to IScheduleListSchedule format for ScheduleSummary
    return combinations.map((combination) => {
      const scheduleData: IScheduleListSchedule = {
        _id: schedule._id,
        name: schedule.name,
        year: schedule.year,
        semester: schedule.semester,
        sessionId: schedule.sessionId,
        events: schedule.events,
        classes: combination,
      };

      return scheduleData;
    });
  }, [selectedClasses, schedule, open]);

  const handleSelectSchedule = useCallback(() => {
    if (activeScheduleIndex === null || typeof generatedSchedules === "string")
      return;

    const selectedSchedule = generatedSchedules[activeScheduleIndex];

    if (!selectedSchedule) return;

    // Update the schedule with the selected combination
    updateSchedule(
      schedule._id,
      {
        classes: selectedSchedule.classes.map(
          ({
            selectedSections,
            class: { number, subject, courseNumber },
            color,
          }) => ({
            subject,
            courseNumber,
            number,
            sectionIds: selectedSections.map((s) => s.sectionId),
            color,
          })
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
  }, [activeScheduleIndex, generatedSchedules, schedule._id, updateSchedule]);

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
              {generatedSchedules.length > 0 &&
              typeof generatedSchedules !== "string" ? (
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
                    {typeof generatedSchedules === "string"
                      ? generatedSchedules
                      : "No valid schedule combinations found."}
                  </p>
                  {typeof generatedSchedules !== "string" && (
                    <p className={styles.emptyStateMessage}>
                      {selectedClasses.length === 0
                        ? "Select at least one course to generate schedules."
                        : "All section combinations have time conflicts."}
                    </p>
                  )}
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
      <div onClick={() => setOpen(true)}>{children}</div>
    </Dialog.Root>
  );
}
