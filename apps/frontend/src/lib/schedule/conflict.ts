import type { IScheduleListSchedule } from "@/lib/api/schedules";

/**
 * Meeting time interface for conflict detection.
 * Compatible with both catalog classes and schedule sections/events.
 */
export interface Meeting {
  days?: (boolean | null)[] | null;
  startTime?: string | null;
  endTime?: string | null;
}

/**
 * Parse time string "HH:MM" to minutes since midnight.
 */
export const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if two meetings overlap in time.
 * Returns true if meetings occur on the same day and their times overlap.
 */
export const meetingsOverlap = (
  meeting1: Meeting,
  meeting2: Meeting
): boolean => {
  // Check if meetings occur on the same day
  const sameDay = meeting1.days?.some(
    (day, index) => day && meeting2.days?.[index]
  );
  if (!sameDay) return false;

  // Both meetings must have valid times
  if (
    !meeting1.startTime ||
    !meeting1.endTime ||
    !meeting2.startTime ||
    !meeting2.endTime
  ) {
    return false;
  }

  const start1 = parseTime(meeting1.startTime);
  const end1 = parseTime(meeting1.endTime);
  const start2 = parseTime(meeting2.startTime);
  const end2 = parseTime(meeting2.endTime);

  // Two time ranges overlap if: start1 < end2 AND start2 < end1
  // This covers all overlap cases: partial overlap, one containing the other, etc.
  return start1 < end2 && start2 < end1;
};

/**
 * Get all meetings from a schedule that should be checked for conflicts.
 * This includes:
 * - Meetings from selected sections of non-hidden classes
 * - Custom events that are not hidden
 */
export const getScheduleMeetings = (
  schedule: NonNullable<IScheduleListSchedule>
): Meeting[] => {
  const meetings: Meeting[] = [];

  // Get meetings from non-hidden classes
  for (const scheduleClass of schedule.classes) {
    if (scheduleClass.hidden) continue;

    const classData = scheduleClass.class;
    const allSections = [classData.primarySection, ...classData.sections];

    // Get meetings from selected sections only
    for (const selectedSection of scheduleClass.selectedSections) {
      const section = allSections.find(
        (s) => s?.sectionId === selectedSection.sectionId
      );
      if (section?.meetings) {
        meetings.push(...section.meetings);
      }
    }
  }

  // Get non-hidden custom events
  for (const event of schedule.events) {
    if (event.hidden) continue;
    meetings.push({
      days: event.days,
      startTime: event.startTime,
      endTime: event.endTime,
    });
  }

  return meetings;
};

/**
 * Check if a class's meetings conflict with any meetings in a schedule.
 * Returns true if there is at least one conflict.
 *
 * @param classMeetings - The meetings from the catalog class to check
 * @param schedule - The schedule to check against (non-hidden items only)
 */
export const classConflictsWithSchedule = (
  classMeetings: Meeting[],
  schedule: NonNullable<IScheduleListSchedule>
): boolean => {
  if (classMeetings.length === 0) return false;

  const scheduleMeetings = getScheduleMeetings(schedule);
  if (scheduleMeetings.length === 0) return false;

  // Check if any class meeting conflicts with any schedule meeting
  for (const classMeeting of classMeetings) {
    for (const scheduleMeeting of scheduleMeetings) {
      if (meetingsOverlap(classMeeting, scheduleMeeting)) {
        return true;
      }
    }
  }

  return false;
};
