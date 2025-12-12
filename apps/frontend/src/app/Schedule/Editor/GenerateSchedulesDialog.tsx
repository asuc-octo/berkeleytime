import { useCallback, useEffect, useMemo, useState } from "react";

import { Button, Dialog, Flex } from "@repo/theme";
import { Color, SelectItem } from "@repo/theme";
import { Xmark } from "iconoir-react";

import ScheduleSummary from "@/components/ScheduleSummary";
import { useUpdateSchedule } from "@/hooks/api";
import { ISchedule, IScheduleClass } from "@/lib/api";
import { IScheduleListClass, IScheduleListSchedule } from "@/lib/api/schedules";


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
  component: string | undefined;
  index: number;
}

/**
 * Generates all possible combinations (like permutations) of indices 
 * where the value at each index i ranges from 0 up to limitArray[i] (exclusive).
 * * @param limitArray An array where limitArray[i] is the exclusive upper limit for the i-th position.
 * @returns An array of number arrays, where each inner array is a generated combination.
 */
function genreatePermutations(limitArray: ComponentIndex[]): ComponentIndex[][] {
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
      const upperLimit = limitArray[index].index; 
      
      // 2. Recursive Step: Iterate through all possible values for the current index
      for (let value = 0; value < upperLimit; value++) {
          // Add the current value to the combination
          currentCombination.push({ component: limitArray[index].component, index: value });
          
          // Recurse to the next index
          dfs(index + 1, currentCombination);
          
          // Backtrack: Remove the last element to prepare for the next iteration
          // This is crucial for exploring other paths/values at the current index.
          currentCombination.pop();
      }
  }
  
  // Start the DFS from the first index (0) with an empty combination
  dfs(0, []);
  
  return results;
}

const detectMeetingOverlap = (section1: IScheduleClass["class"]["primarySection"] | undefined, section2: IScheduleClass["class"]["primarySection"] | undefined): boolean => {
  if ( !section1 || !section2 ) return false;
  if ( section1.meetings.length === 0 || section2.meetings.length === 0 ) return false;
  for ( const meeting1 of section1.meetings ) {
    for ( const meeting2 of section2.meetings ) {
      // Check if meetings occur on the same day
      const sameDay = meeting1.days?.some((day, index) => day && meeting2.days?.[index]);
      if ( !sameDay ) continue;
      
      // Both meetings must have valid times
      if ( !meeting1.startTime || !meeting1.endTime || !meeting2.startTime || !meeting2.endTime ) continue;
      
      const start1 = parseTime(meeting1.startTime);
      const end1 = parseTime(meeting1.endTime);
      const start2 = parseTime(meeting2.startTime);
      const end2 = parseTime(meeting2.endTime);
      
      // Two time ranges overlap if: start1 < end2 AND start2 < end1
      // This covers all overlap cases: partial overlap, one containing the other, etc.
      if ( start1 < end2 && start2 < end1 ) {
        return true;
      }
    }
  }
  return false;
}

const validCombination = (classes: IScheduleClass[], current: ComponentIndex[][], newClass: ComponentIndex[], newClassIndex: number): boolean => {
  for ( const ci1 of newClass ) {
    for ( let i = 0; i < current.length; i++ ) {
      for ( const ci2 of current[i] ) {
        const section1 = (ci1.index === classes[newClassIndex].class.sections.length) ? classes[newClassIndex].class.primarySection : classes[newClassIndex].class.sections[ci1.index];
        const section2 = (ci2.index === classes[i].class.sections.length) ? classes[i].class.primarySection : classes[i].class.sections[ci2.index];
        if ( detectMeetingOverlap(section1, section2) ) {
          return false;
        }
      }
    }
  }
  // detect self overlap
  for ( const ci1 of newClass ) {
    for ( const ci2 of newClass ) {
      if ( ci1.index === ci2.index ) continue;
      const section1 = (ci1.index === classes[newClassIndex].class.sections.length) ? classes[newClassIndex].class.primarySection : classes[newClassIndex].class.sections[ci1.index];
      const section2 = (ci2.index === classes[newClassIndex].class.sections.length) ? classes[newClassIndex].class.primarySection : classes[newClassIndex].class.sections[ci2.index];
      if ( detectMeetingOverlap(section1, section2) ) {
        return false;
      }
    }
  }
  return true;
}

// Generate all combinations of sections from selected classes
const generateCombinations = (
  selectedClasses: IScheduleClass[]
): IScheduleListClass[][] => {
  if (selectedClasses.length === 0) return [];

  const generate = (current: ComponentIndex[][], index: number): Array<ComponentIndex[][]> => {
    if ( index == selectedClasses.length ) return [current];

    const allComponents = [ selectedClasses[index].class.primarySection?.component, ...selectedClasses[index].class.sections.map(s => s.component) ];
    const allSections = [ ...selectedClasses[index].class.sections, selectedClasses[index].class.primarySection ];
    const componentArrays: Map<string | undefined, number[]> = allSections.reduce((acc, curr, i) => {
      if ( !curr || !curr.component ) return acc;
      if ( acc.get(curr.component) ) {
        acc.get(curr.component)?.push(i);
      } else {
        acc.set(curr.component, [i]);
      }
      return acc;
    }, new Map<string, number[]>());
    const componentCounts = [...new Set(allComponents)].map(component => {
      return {
        component,
        index: allComponents.filter(c => c === component).length,
      }
    });
    const allCombinations = genreatePermutations(componentCounts);
    const adjCombinations = allCombinations.map(combination => {
      return combination.map(ci => {
        return {
          component: ci.component,
          index: componentArrays.get(ci.component)![ci.index],
        }
      });
    });
    const filtered = adjCombinations.filter(combination => {
      return validCombination(selectedClasses, current, combination, index);
    });
    return filtered.map(c => [...current, c])
    .map(c => { return [...(generate(c, index + 1))]; }).flat();
  }
  
  const combinations = generate([], 0);
  console.log(combinations);
  return combinations.map( (c) => {
    return c.map( (cis, index) => {
      return {
        class: selectedClasses[index].class,
        selectedSections: cis.map(ci => {
          return {
            sectionId: (ci.index === selectedClasses[index].class.sections.length) ? selectedClasses[index].class.primarySection?.sectionId : selectedClasses[index].class.sections[ci.index]?.sectionId,
          }
        }),
        color: selectedClasses[index].color,
      };
    });
  });
}

export default function GenerateSchedulesDialog({
  schedule,
  children,
}: GenerateSchedulesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<IScheduleClass[]>([]);
  const [activeScheduleIndex, setActiveScheduleIndex] = useState<number | null>(null);
  const [updateSchedule] = useUpdateSchedule();

  // Initialize selected classes from schedule when dialog opens
  useEffect(() => {
    if (open) {
      // Start with all classes that have at least one selected section
      const classesWithSections = schedule.classes.filter(
        (c) => c.selectedSections.length > 0
      );
      setSelectedClasses(classesWithSections);
    }
  }, [open, schedule.classes]);

  // Sync selected classes with schedule changes (when classes are added/removed)
  useEffect(() => {
    if (open) {
      // Update selected classes to match current schedule
      // Remove classes that no longer exist in schedule
      const updatedSelectedClasses = selectedClasses.filter((selectedClass) =>
        schedule.classes.some(
          (c) =>
            c.class.subject === selectedClass.class.subject &&
            c.class.courseNumber === selectedClass.class.courseNumber &&
            c.class.number === selectedClass.class.number
        )
      );

      // Add new classes that have selected sections
      const newClasses = schedule.classes.filter(
        (c) =>
          c.selectedSections.length > 0 &&
          !updatedSelectedClasses.some(
            (sc) =>
              sc.class.subject === c.class.subject &&
              sc.class.courseNumber === c.class.courseNumber &&
              sc.class.number === c.class.number
          )
      );

      setSelectedClasses([...updatedSelectedClasses, ...newClasses]);
    }
  }, [schedule.classes, open]);

  // Generate all valid schedule combinations
  const generatedSchedules = useMemo(() => {
    if (selectedClasses.length === 0) return [];

    const combinations = generateCombinations(selectedClasses);

    // Convert combinations to IScheduleListSchedule format for ScheduleSummary
    return combinations.map((combination) => {
      const scheduleData: IScheduleListSchedule = {
        _id: schedule._id,
        name: schedule.name,
        year: schedule.year,
        semester: schedule.semester,
        sessionId: schedule.sessionId,
        events: schedule.events.map((event) => ({
          _id: event._id,
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          days: event.days,
          color: event.color,
        })),
        classes: combination
      };

      return scheduleData;
    });
  }, [selectedClasses, schedule]);

  const handleRemoveClass = useCallback(
    (classToRemove: IScheduleClass) => {
      setSelectedClasses((prev) =>
        prev.filter(
          (c) =>
            !(
              c.class.subject === classToRemove.class.subject &&
              c.class.courseNumber === classToRemove.class.courseNumber &&
              c.class.number === classToRemove.class.number
            )
        )
      );
    },
    []
  );

  const handleSelectSchedule = useCallback(() => {
    if (activeScheduleIndex === null) return;

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
      <Dialog.Card style={{ maxWidth: "90vw", width: "1200px", maxHeight: "90vh" }}>
        <Dialog.Header title="Generated Schedules" hasCloseButton />
        <Dialog.Body style={{ overflowY: "auto", maxHeight: "calc(90vh - 200px)" }}>
          <Flex direction="column" gap="4" width="100%">
            <Flex direction="column" gap="2" width="100%">
              <h3 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
                SELECTED COURSE(S)
              </h3>
              <Flex direction="row" gap="2" wrap="wrap">
                {selectedClasses.map((selectedClass) => {
                  const courseName = `${selectedClass.class.subject} ${selectedClass.class.courseNumber}`;
                  return (
                    <div
                      key={`${selectedClass.class.subject}-${selectedClass.class.courseNumber}-${selectedClass.class.number}`}
                      style={{ display: "inline-block" }}
                    >
                      <SelectItem
                        label={courseName}
                        color={selectedClass.color as Color}
                        icon={
                          <Xmark
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveClass(selectedClass);
                            }}
                          />
                        }
                      />
                    </div>
                  );
                })}
              </Flex>
            </Flex>

            {generatedSchedules.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "16px",
                  marginTop: "16px",
                }}
              >
                {generatedSchedules.map((generatedSchedule, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveScheduleIndex(index)}
                    style={{
                      cursor: "pointer",
                      border:
                        activeScheduleIndex === index
                          ? "2px solid var(--blue-500)"
                          : "2px solid transparent",
                      borderRadius: "8px",
                      padding: "8px",
                      transition: "border-color 0.2s",
                    }}
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
                style={{ padding: "40px", color: "var(--label-color)" }}
              >
                <p>No valid schedule combinations found.</p>
                <p style={{ fontSize: "12px", marginTop: "8px" }}>
                  {selectedClasses.length === 0
                    ? "Select at least one course to generate schedules."
                    : "All section combinations have time conflicts."}
                </p>
              </Flex>
            )}
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
