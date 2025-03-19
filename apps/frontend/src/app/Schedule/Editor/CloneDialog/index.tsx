import { ReactNode, useState } from "react";

import { ArrowRight, Xmark } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Checkbox,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Input,
  LoadingIndicator,
  Text,
} from "@repo/theme";

import { useCreateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";

interface CloneDialogProps {
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function CloneDialog({ children }: CloneDialogProps) {
  const { schedule } = useSchedule();
  const navigate = useNavigate();

  const [createSchedule] = useCreateSchedule();

  const [name, setName] = useState(`${schedule.name} (copy)`);
  const [events, setEvents] = useState(true);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);

    const { data } = await createSchedule({
      year: schedule.year,
      semester: schedule.semester,
      classes: schedule.classes.map((_class) => ({
        subject: _class.class.subject,
        courseNumber: _class.class.courseNumber,
        number: _class.class.number,
        sectionIds: _class.selectedSections.map((s) => s.sectionId),
      })),
      events: events
        ? schedule.events.map((e) => {
            // TODO: Clean up

            // eslint-disable-next-line
            const { _id, __typename, ...rest } = (e as any) || {};

            return rest;
          })
        : [],
      name: name,
      sessionId: schedule.sessionId,
    });

    setLoading(false);

    if (!data) return;

    navigate(`/schedules/${data.createSchedule._id}`);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && loading) return;

    setOpen(open);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <Flex p="4" direction="column" gap="4">
            <Flex align="start" gap="4">
              <Flex direction="column" gap="1" flexGrow="1">
                <Dialog.Title asChild>
                  <Heading>Clone schedule</Heading>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <Text>Create a copy of this schedule</Text>
                </Dialog.Description>
              </Flex>
              <Dialog.Close asChild>
                <IconButton disabled={loading}>
                  <Xmark />
                </IconButton>
              </Dialog.Close>
            </Flex>
            <Flex direction="column" gap="3">
              <Input
                placeholder="Schedule name"
                value={name}
                disabled={loading}
                onChange={(event) => setName(event.target.value)}
              />
              <label>
                <Flex align="center" gap="3">
                  <Checkbox
                    disabled={loading}
                    checked={events}
                    onCheckedChange={(value) => setEvents(value as boolean)}
                  />
                  <Text as="span">Include custom events</Text>
                </Flex>
              </label>
            </Flex>
            <Button
              onClick={() => confirm()}
              variant="solid"
              disabled={loading}
            >
              Confirm
              <LoadingIndicator loading={loading}>
                <ArrowRight />
              </LoadingIndicator>
            </Button>
          </Flex>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
