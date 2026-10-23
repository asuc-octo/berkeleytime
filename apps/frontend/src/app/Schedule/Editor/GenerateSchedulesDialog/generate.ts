import { IScheduleClass, IScheduleEvent } from "@/lib/api/schedules";
import { Component } from "@/lib/generated/graphql";
import { Meeting, meetingsOverlap, parseTime } from "@/lib/schedule/conflict";

type Section = IScheduleClass["class"]["sections"][number];
type SectionId = Section["sectionId"];

// Maximum number of schedules returned to the dialog
export const MAX_GENERATED_SCHEDULES = 200;

// Upper bound on the search so a pathological selection cannot freeze the tab
const MAX_SEARCH_STEPS = 200_000;

// A choice for one component of one class (or a custom event)
interface Option {
  label: string;
  sectionIds: SectionId[];
  meetings: Meeting[];
}

interface Slot {
  classIndex: number;
  label: string;
  options: Option[];
}

export interface GenerationResult {
  // One entry per schedule, each aligned with the classes passed in
  schedules: SectionId[][][];
  // More valid schedules exist than were returned
  truncated: boolean;
  // The search was cut off before every combination was checked
  exhausted: boolean;
  // Why no schedule could be generated
  conflicts: string[];
  // Components (e.g. "MATH 53 DIS") whose sections have no posted times yet
  unscheduled: string[];
}

// Shortest meeting treated as a real one
const MIN_MEETING_MINUTES = 10;

// Sections often have no days or times until they are announced, and
// catch-all sections (e.g. DIS 999) carry stand-in times like 00:00-00:01
const isScheduled = (meeting: Meeting) =>
  !!meeting.days?.some(Boolean) &&
  !!meeting.startTime &&
  !!meeting.endTime &&
  parseTime(meeting.endTime) - parseTime(meeting.startTime) >=
    MIN_MEETING_MINUTES;

// Sections with the same key occupy the same time slots; "" means unscheduled
const getTimeKey = (section: Section) =>
  section.meetings
    .filter(isScheduled)
    .map(
      (meeting) =>
        `${meeting.days!.map((day) => (day ? 1 : 0)).join("")}@${meeting.startTime}-${meeting.endTime}`
    )
    .sort()
    .join(",");

const toOption = (label: string, sections: Section[]): Option => ({
  label,
  sectionIds: sections.map((section) => section.sectionId),
  meetings: sections.flatMap((section) => section.meetings.filter(isScheduled)),
});

const overlaps = (option1: Option, option2: Option) =>
  option1.meetings.some((meeting1) =>
    option2.meetings.some((meeting2) => meetingsOverlap(meeting1, meeting2))
  );

const getSlots = (selectedClasses: IScheduleClass[]) => {
  const slots: Slot[] = [];
  const unscheduled: string[] = [];

  selectedClasses.forEach((selectedClass, classIndex) => {
    const { class: _class } = selectedClass;
    const course = `${_class.subject} ${_class.courseNumber}`;

    const sections = [_class.primarySection, ..._class.sections].filter(
      (section): section is Section => !!section?.component
    );

    const selectedIds = new Set(
      selectedClass.selectedSections.map((section) => section.sectionId)
    );

    // If a class is locked, its current selection is the only option
    if (selectedClass.locked) {
      slots.push({
        classIndex,
        label: course,
        options: [
          toOption(
            course,
            sections.filter((section) => selectedIds.has(section.sectionId))
          ),
        ],
      });

      return;
    }

    const byComponent = new Map<Component, Section[]>();

    for (const section of sections) {
      const componentSections = byComponent.get(section.component);

      if (componentSections) componentSections.push(section);
      else byComponent.set(section.component, [section]);
    }

    for (const [component, componentSections] of byComponent) {
      const label = `${course} ${component}`;
      const getLabel = (section: Section) => `${label} ${section.number}`;

      const selected = componentSections.find((section) =>
        selectedIds.has(section.sectionId)
      );

      if (selectedClass.lockedComponents?.includes(component)) {
        slots.push({
          classIndex,
          label,
          options: [
            selected
              ? toOption(getLabel(selected), [selected])
              : toOption(label, []),
          ],
        });

        continue;
      }

      // Sections meeting at the same times are interchangeable, so only one
      // of them (preferring the current selection) needs to be considered
      const byTime = new Map<string, Section[]>();

      for (const section of componentSections) {
        if (selectedClass.blockedSections?.includes(section.sectionId))
          continue;

        const key = getTimeKey(section);
        const timeSections = byTime.get(key);

        if (timeSections) timeSections.push(section);
        else byTime.set(key, [section]);
      }

      // Placeholder sections without a real time sit alongside the ones that
      // have one, and only the latter decide the schedule
      if (byTime.size > 1) byTime.delete("");

      const options: Option[] = [];

      for (const [key, timeSections] of byTime) {
        const kept = timeSections.find((section) => section === selected);

        if (key) {
          const section = kept ?? timeSections[0];
          options.push(toOption(getLabel(section), [section]));

          continue;
        }

        // Unscheduled sections cannot be told apart, so the current selection
        // is kept rather than choosing one arbitrarily
        options.push(toOption(label, kept ? [kept] : []));
      }

      if (byTime.size === 1 && byTime.has("")) unscheduled.push(label);

      // Edge case where everything was excluded, we still want this to function
      if (options.length === 0) options.push(toOption(label, []));

      slots.push({ classIndex, label, options });
    }
  });

  return { slots, unscheduled };
};

// Explain why no schedule exists in terms of the choices that cannot change
const getConflicts = (slots: Slot[], events: Option[]) => {
  const fixed = [
    ...events,
    ...slots
      .filter((slot) => slot.options.length === 1)
      .map((slot) => slot.options[0]),
  ];

  const conflicts: string[] = [];

  for (let i = 0; i < fixed.length; i++) {
    for (let j = i + 1; j < fixed.length; j++) {
      if (overlaps(fixed[i], fixed[j]))
        conflicts.push(`${fixed[i].label} overlaps ${fixed[j].label}.`);
    }
  }

  if (conflicts.length > 0) return conflicts;

  for (const slot of slots) {
    if (slot.options.length < 2) continue;

    const blockers = new Set<string>();

    const blocked = slot.options.every((option) => {
      const blocker = fixed.find((other) => overlaps(option, other));
      if (blocker) blockers.add(blocker.label);

      return !!blocker;
    });

    if (blocked)
      conflicts.push(
        `Every ${slot.label} section overlaps ${Array.from(blockers).join(" or ")}.`
      );
  }

  if (conflicts.length > 0) return conflicts;

  return ["No combination of the remaining sections avoids a time conflict."];
};

// Generate combinations of sections from selected classes without conflicts
export const generateSchedules = (
  selectedClasses: IScheduleClass[],
  selectedEvents: IScheduleEvent[]
): GenerationResult => {
  const { slots, unscheduled } = getSlots(selectedClasses);

  const events = selectedEvents.map((event) => ({
    label: event.title || "Custom event",
    sectionIds: [],
    meetings: [event],
  }));

  const schedules: SectionId[][][] = [];
  const placed: Option[] = [...events];

  let truncated = false;
  let exhausted = false;
  let steps = 0;

  const search = (index: number) => {
    if (index === slots.length) {
      if (schedules.length >= MAX_GENERATED_SCHEDULES) {
        truncated = true;
        return;
      }

      const schedule: SectionId[][] = selectedClasses.map(() => []);

      slots.forEach((slot, slotIndex) => {
        const option = placed[events.length + slotIndex];
        schedule[slot.classIndex].push(...option.sectionIds);
      });

      schedules.push(schedule);

      return;
    }

    for (const option of slots[index].options) {
      if (steps++ >= MAX_SEARCH_STEPS) {
        exhausted = true;
        return;
      }

      // Skip conflicting options early rather than filtering full schedules
      if (placed.some((other) => overlaps(option, other))) continue;

      placed.push(option);
      search(index + 1);
      placed.pop();

      if (truncated || exhausted) return;
    }
  };

  if (selectedClasses.length > 0) search(0);

  return {
    schedules,
    truncated,
    exhausted,
    conflicts:
      schedules.length === 0 && !exhausted && selectedClasses.length > 0
        ? getConflicts(slots, events)
        : [],
    unscheduled,
  };
};
