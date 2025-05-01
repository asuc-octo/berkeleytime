import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";

import { READ_SCHEDULE, ReadScheduleResponse, ISchedule } from "@/lib/api";

export interface TimeSlot {
    day: number[];   
    start: number;  
    end: number;    
}

export function covertTimeSlots(days: boolean[], startTime: string, endTime: string): TimeSlot {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const flag: number[] = [];

  days.forEach((isDaySelected, idx) => {
    if (isDaySelected) {
      flag.push(idx + 1);
    }
  });

  return {
    day: flag,
    start,
    end,
  };
}


export function extractTimeSlotsFromSchedule(schedule: ISchedule): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];

  for (const selectedClass of schedule.classes) {
    const _class = selectedClass.class;
    const selectedSections = selectedClass.selectedSections ?? [];
    for (const shortSec of selectedSections) {
      const fullSec =
        _class.sections.find(sec => sec.sectionId === shortSec.sectionId) 
        || (_class.primarySection.sectionId === shortSec.sectionId
            ? _class.primarySection
            : undefined);

      if (!fullSec) continue;
      for (const meeting of fullSec.meetings ?? []) {
        const slot = covertTimeSlots(
          meeting.days,
          meeting.startTime,
          meeting.endTime
        );
        timeSlots.push(slot);
      }
    }
  }

  for (const ev of schedule.events ?? []) {
    const slot = covertTimeSlots(
      ev.days,
      ev.startTime,
      ev.endTime
    );
    timeSlots.push(slot);
  }

  return timeSlots;
}


export default function useScheduleTimeSlots(): TimeSlot[] {
    const [searchParams] = useSearchParams();
    const scheduleId = searchParams.get('selectedSchedule');

    const { data: scheduleData} = useQuery<ReadScheduleResponse>(READ_SCHEDULE, {
        variables: { id:scheduleId! },
        skip: !scheduleId,
    });

    const selectedScheduleMemo = useMemo<ISchedule | null>(
        () => scheduleData?.schedule ?? null,
        [scheduleData, searchParams]       
    );

    const timeSlots = useMemo<TimeSlot[]>(
        () =>
        selectedScheduleMemo
            ? extractTimeSlotsFromSchedule(selectedScheduleMemo)
            : [],
        [selectedScheduleMemo]
    );


  return timeSlots;
}
