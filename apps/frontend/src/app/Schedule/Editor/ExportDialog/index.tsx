import { ReactNode, useMemo, useRef, useState } from "react";

import { Calendar, ClipboardCheck, Hashtag, Xmark } from "iconoir-react";

import { Button, Dialog, Flex, Heading, IconButton, Text } from "@repo/theme";

import useSchedule from "@/hooks/useSchedule";
import { copyTextToClipboard } from "@/lib/clipboard";

import exportToCalendar from "../exportToCalendar";

interface ExportDialogProps {
  children: ReactNode;
}

export default function ExportDialog({ children }: ExportDialogProps) {
  const { schedule } = useSchedule();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [copiedClassNumbers, setCopiedClassNumbers] = useState(false);

  const selectedClassNumbers = useMemo(
    () =>
      schedule.classes
        .filter((selectedClass) => !selectedClass.hidden)
        .flatMap((selectedClass) => {
          const sections = [
            selectedClass.class.primarySection,
            ...selectedClass.class.sections,
          ];

          return selectedClass.selectedSections.map(({ sectionId }) => {
            const section = sections.find(
              (currentSection) => currentSection?.sectionId === sectionId
            );
            const label = section
              ? `${selectedClass.class.subject} ${selectedClass.class.courseNumber} ${section.component} ${section.number}`
              : `${selectedClass.class.subject} ${selectedClass.class.courseNumber}`;

            return `${label}: ${sectionId}`;
          });
        }),
    [schedule.classes]
  );

  const handleCopyClassNumbers = async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    await copyTextToClipboard(selectedClassNumbers.join("\n"));
    setCopiedClassNumbers(true);

    timeoutRef.current = setTimeout(() => {
      setCopiedClassNumbers(false);
    }, 1200);
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
                <Heading>Export schedule</Heading>
              </Dialog.Title>
              <Dialog.Description asChild>
                <Text>Download your calendar or copy enrollment numbers</Text>
              </Dialog.Description>
            </Flex>
            <Dialog.Close asChild>
              <IconButton>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </Dialog.Header>
          <Dialog.Body gap="3">
            <Button
              variant="secondary"
              style={{ justifyContent: "flex-start", width: "100%" }}
              onClick={() => exportToCalendar(schedule)}
            >
              <Calendar />
              Download ICS calendar
            </Button>
            <Button
              variant="secondary"
              style={{ justifyContent: "flex-start", width: "100%" }}
              onClick={handleCopyClassNumbers}
              disabled={selectedClassNumbers.length === 0}
            >
              {copiedClassNumbers ? <ClipboardCheck /> : <Hashtag />}
              {copiedClassNumbers
                ? "Copied class numbers"
                : "Copy class numbers"}
            </Button>
          </Dialog.Body>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
