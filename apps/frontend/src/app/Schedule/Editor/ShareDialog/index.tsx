import { ReactNode, useMemo, useRef, useState } from "react";

import { ClipboardCheck, PasteClipboard, ShareIos, Xmark } from "iconoir-react";

import {
  Button,
  Checkbox,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
} from "@repo/theme";

import { useUpdateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";

interface ShareDialogProps {
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function ShareDialog({ children }: ShareDialogProps) {
  const { schedule } = useSchedule();
  const [updateSchedule, { loading }] = useUpdateSchedule();

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [copied, setCopied] = useState(false);

  const content = useMemo(
    () => ({
      url: window.location.href,
      title: schedule.name,
      text: `View my ${schedule.semester} ${schedule.year} schedule on Berkeleytime`,
    }),
    [schedule]
  );

  const canShare = navigator.canShare && navigator.canShare?.(content);

  const copy = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setCopied(true);

    navigator.clipboard.writeText(window.location.href);

    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const handleCheckedChange = async (checked: boolean) => {
    await updateSchedule(
      schedule._id,
      { public: checked },
      {
        optimisticResponse: {
          updateSchedule: { ...schedule, public: checked },
        },
      }
    );
  };

  const generateICS = (schedule: any) => {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const formatTime = (timeStr: string, date: Date) => {
      const [hours, minutes] = timeStr.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return formatDate(newDate);
    };

    const getDayOfWeek = (dayIndex: number) => {
      const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
      return days[dayIndex];
    };

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BerkeleyTime//Schedule Export//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    schedule.classes?.forEach((scheduleClass: any) => {
      const { class: classInfo, selectedSections } = scheduleClass;

      selectedSections?.forEach((selectedSection: any) => {
        const section =
          classInfo.primarySection.sectionId === selectedSection.sectionId
            ? classInfo.primarySection
            : classInfo.sections?.find(
                (s: any) => s.sectionId === selectedSection.sectionId
              );

        if (!section || !section.meetings) return;

        section.meetings.forEach((meeting: any) => {
          if (!meeting.days || !meeting.startTime || !meeting.endTime) return;

          const activeDays = meeting.days
            .map((active: boolean, index: number) =>
              active ? getDayOfWeek(index) : null
            )
            .filter(Boolean);

          if (activeDays.length === 0) return;

          const startDate = new Date(schedule.term?.startDate || new Date());
          const endDate = new Date(schedule.term?.endDate || new Date());

          const eventId = `${section.sectionId}-${meeting.startTime}-${meeting.endTime}`;
          const summary = `${classInfo.subject} ${classInfo.courseNumber} ${section.component}`;
          const description = `${classInfo.course?.title || ""}`;
          const location = meeting.location || "";
          const instructor =
            meeting.instructors
              ?.map((i: any) => `${i.givenName} ${i.familyName}`)
              .join(", ") || "";

          icsContent.push(
            "BEGIN:VEVENT",
            `UID:${eventId}@berkeleytime.com`,
            `DTSTART:${formatTime(meeting.startTime, startDate)}`,
            `DTEND:${formatTime(meeting.endTime, startDate)}`,
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

    schedule.events?.forEach((event: any) => {
      if (!event.days || !event.startTime || !event.endTime) return;

      const activeDays = event.days
        .map((active: boolean, index: number) =>
          active ? getDayOfWeek(index) : null
        )
        .filter(Boolean);

      if (activeDays.length === 0) return;

      const startDate = new Date(schedule.term?.startDate || new Date());
      const endDate = new Date(schedule.term?.endDate || new Date());

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${event._id}@berkeleytime.com`,
        `DTSTART:${formatTime(event.startTime, startDate)}`,
        `DTEND:${formatTime(event.endTime, startDate)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${activeDays.join(",")};UNTIL=${formatDate(endDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ""}`,
        `LOCATION:${event.location || ""}`,
        `CREATED:${formatDate(new Date())}`,
        `LAST-MODIFIED:${formatDate(new Date())}`,
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");
    return icsContent.join("\r\n");
  };

  const exportToCalendar = () => {
    const icsContent = generateICS(schedule);
    const dataUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${schedule.name || "schedule"}.ics`;
    link.click();
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <Dialog.Header>
            <Flex direction="column" gap="1" flexGrow="1">
              <Dialog.Title asChild>
                <Heading>Share schedule</Heading>
              </Dialog.Title>
              <Dialog.Description asChild>
                <Text>Manage who can view your schedule</Text>
              </Dialog.Description>
            </Flex>
            <Dialog.Close asChild>
              <IconButton>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </Dialog.Header>
          <Dialog.Body gap="3">
            <Flex gap="3">
              <Input
                readOnly
                type="url"
                value={window.location.origin + window.location.pathname}
              />
              {canShare ? (
                <Button onClick={() => navigator.share(content)}>
                  Share
                  <ShareIos />
                </Button>
              ) : (
                <Button onClick={() => copy()}>
                  {copied ? <ClipboardCheck /> : <PasteClipboard />}
                  {copied ? "Copied" : "Copy link"}
                </Button>
              )}
            </Flex>
            <label>
              <Flex align="center" gap="3">
                <Checkbox
                  checked={schedule.public}
                  onCheckedChange={handleCheckedChange}
                  disabled={loading}
                />
                <Text as="span">Anyone with the link can view</Text>
              </Flex>
            </label>
            <Button onClick={exportToCalendar}>Export to Calendar</Button>
          </Dialog.Body>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
