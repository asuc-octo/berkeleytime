import { ISchedule } from "@/lib/api";

const generateICS = (schedule: ISchedule) => {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const formatTime = (timeStr: string, date: Date) => {
    const [hours, minutes] = timeStr.split(":");
    // Format as local time in Pacific timezone (no UTC conversion, no Z suffix)
    // Since dates are already in Pacific time, we just format the components directly
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(parseInt(hours)).padStart(2, "0");
    const minute = String(parseInt(minutes)).padStart(2, "0");
    return `${year}${month}${day}T${hour}${minute}00`;
  };

  const getDayOfWeek = (dayIndex: number) => {
    const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
    return days[dayIndex];
  };

  const findFirstOccurrenceDate = (
    startDate: Date,
    activeDayIndices: number[]
  ): Date => {
    if (activeDayIndices.length === 0) return startDate;

    const currentDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to Monday=0, Tuesday=1, ..., Sunday=6 format to match our days array
    const normalizedCurrentDay =
      currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    // Find the first active day that is >= current day
    const nextActiveDay = activeDayIndices.find(
      (dayIndex) => dayIndex >= normalizedCurrentDay
    );

    if (nextActiveDay !== undefined) {
      // Move to the next active day in the current week
      const daysToAdd = nextActiveDay - normalizedCurrentDay;
      const resultDate = new Date(startDate);
      resultDate.setDate(startDate.getDate() + daysToAdd);
      return resultDate;
    } else {
      // No active day found in current week, move to first active day of next week
      const firstActiveDay = Math.min(...activeDayIndices);
      const daysToAdd = 7 - normalizedCurrentDay + firstActiveDay;
      const resultDate = new Date(startDate);
      resultDate.setDate(startDate.getDate() + daysToAdd);
      return resultDate;
    }
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BerkeleyTime//Schedule Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:America/Los_Angeles",
    "BEGIN:STANDARD",
    "DTSTART:20071104T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "TZOFFSETFROM:-0700",
    "TZOFFSETTO:-0800",
    "TZNAME:PST",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:20070311T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "TZOFFSETFROM:-0800",
    "TZOFFSETTO:-0700",
    "TZNAME:PDT",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
  ];

  schedule.classes?.forEach((scheduleClass) => {
    if (scheduleClass.hidden) return;

    const { class: classInfo, selectedSections } = scheduleClass;

    selectedSections?.forEach((selectedSection) => {
      const section =
        classInfo.primarySection?.sectionId === selectedSection.sectionId
          ? classInfo.primarySection
          : classInfo.sections?.find(
              (s) => s.sectionId === selectedSection.sectionId
            );

      if (!section || !section.meetings) return;

      section.meetings.forEach((meeting) => {
        if (!meeting.days || !meeting.startTime || !meeting.endTime) return;

        const activeDayIndices = meeting.days
          .map((active: boolean, index: number) => (active ? index : -1))
          .filter((index) => index !== -1);

        if (activeDayIndices.length === 0) return;

        const activeDays = activeDayIndices.map((index) => getDayOfWeek(index));

        // Compute start of event: max(section.startDate, schedule.term.startDate)
        const sectionStartDate = new Date(
          section.startDate || schedule.term?.startDate || new Date()
        );
        const termStartDate = new Date(schedule.term?.startDate || new Date());
        const baseStartDate = new Date(
          Math.max(sectionStartDate.getTime(), termStartDate.getTime())
        );

        // Adjust to the first occurrence day
        const startDate = findFirstOccurrenceDate(
          baseStartDate,
          activeDayIndices
        );

        // Compute end of event: min(section.endDate - 1 week, schedule.term.endDate)
        const sectionEndDate = new Date(
          section.endDate || schedule.term?.endDate || new Date()
        );
        // Subtract 1 week non-inclusive (6 days * ms per day) from sectionEndDate (RRR week)
        const sectionEndDateMinusWeek = new Date(
          sectionEndDate.getTime() - 6 * 24 * 60 * 60 * 1000
        );
        const termEndDate = new Date(schedule.term?.endDate || new Date());
        const endDate = new Date(
          Math.min(sectionEndDateMinusWeek.getTime(), termEndDate.getTime())
        );

        const eventId = `${section.sectionId}-${meeting.startTime}-${meeting.endTime}`;
        const summary = `${classInfo.subject} ${classInfo.courseNumber} ${section.component}`;
        const description = `${classInfo.course?.title || ""}`;
        const location = meeting.location || "";
        const instructor =
          meeting.instructors
            ?.map((i) => `${i.givenName} ${i.familyName}`)
            .join(", ") || "";

        icsContent.push(
          "BEGIN:VEVENT",
          `UID:${eventId}@berkeleytime.com`,
          `DTSTART;TZID=America/Los_Angeles:${formatTime(meeting.startTime, startDate)}`,
          `DTEND;TZID=America/Los_Angeles:${formatTime(meeting.endTime, startDate)}`,
          `RRULE:FREQ=WEEKLY;BYDAY=${activeDays.join(",")};UNTIL=${formatDate(endDate)}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}${instructor ? `\nInstructor: ${instructor}` : ""}`,
          `LOCATION:${location}`,
          `CREATED:${formatDate(new Date())}`,
          `LAST-MODIFIED:${formatDate(new Date())}`,
          "END:VEVENT"
        );
      });
    });
  });

  schedule.events?.forEach((event) => {
    if (!event.days || !event.startTime || !event.endTime || event.hidden)
      return;

    const activeDayIndices = event.days
      .map((active: boolean, index: number) => (active ? index : -1))
      .filter((index) => index !== -1);

    if (activeDayIndices.length === 0) return;

    const activeDays = activeDayIndices.map((index) => getDayOfWeek(index));

    const baseStartDate = new Date(schedule.term?.startDate || new Date());
    const startDate = findFirstOccurrenceDate(baseStartDate, activeDayIndices);
    const endDate = new Date(schedule.term?.endDate || new Date());

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:${event._id}@berkeleytime.com`,
      `DTSTART;TZID=America/Los_Angeles:${formatTime(event.startTime, startDate)}`,
      `DTEND;TZID=America/Los_Angeles:${formatTime(event.endTime, startDate)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${activeDays.join(",")};UNTIL=${formatDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ""}`,
      `LOCATION:`,
      `CREATED:${formatDate(new Date())}`,
      `LAST-MODIFIED:${formatDate(new Date())}`,
      "END:VEVENT"
    );
  });

  icsContent.push("END:VCALENDAR");
  return icsContent.join("\r\n");
};

export default function exportToCalendar(schedule: ISchedule) {
  const icsContent = generateICS(schedule);
  const dataUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${schedule.name || "schedule"}.ics`;
  link.click();
}
