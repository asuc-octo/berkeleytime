import { ReactNode, useState } from "react";

import { ArrowRight, Xmark } from "iconoir-react";

import {
  Button,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Input,
  Label,
  Text,
} from "@repo/theme";

import { useUpdateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";

import styles from "./EventDialog.module.scss";

interface EventDialogProps {
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function EventDialog({ children }: EventDialogProps) {
  const { schedule } = useSchedule();
  const [open, setOpen] = useState(false);
  const [updateSchedule] = useUpdateSchedule();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("11:30");
  const [endTime, setEndTime] = useState("15:50");
  const [days, setDays] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const save = () => {
    if (title === "") return;
    if (
      parseInt(startTime.replace(":", ""), 10) >=
      parseInt(endTime.replace(":", ""), 10)
    )
      return;
    const temporaryIdentifier = crypto.randomUUID();

    const event = {
      title,
      description,
      startTime,
      endTime,
      days,
    };

    updateSchedule(
      schedule._id,
      {
        events: schedule.events
          ? [
              ...schedule.events.map((e) => {
                // TODO: Clean up

                // eslint-disable-next-line
                const { _id, __typename, ...rest } = (e as any) || {};
                return rest;
              }),
              event,
            ]
          : [event],
      },
      {
        optimisticResponse: {
          updateSchedule: {
            ...schedule,
            events: schedule.events
              ? [
                  ...schedule.events,
                  {
                    ...event,
                    _id: temporaryIdentifier,
                    __typename: "ScheduleEvent",
                  },
                ]
              : [
                  {
                    ...event,
                    _id: temporaryIdentifier,
                    __typename: "ScheduleEvent",
                  },
                ],
          },
        },
      }
    );

    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <Flex p="4" direction="column" gap="4">
            <Flex align="start" gap="4">
              <Flex direction="column" gap="1" flexGrow="1">
                <Dialog.Title asChild>
                  <Heading>Add a custom event</Heading>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <Text>Insert a custom event in your schedule</Text>
                </Dialog.Description>
              </Flex>
              <Dialog.Close asChild>
                <IconButton>
                  <Xmark />
                </IconButton>
              </Dialog.Close>
            </Flex>
            <Flex direction="column" gap="2">
              <Label>Name</Label>
              <Input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter a name"
              />
            </Flex>
            <Flex direction="column" gap="2">
              <Label>Time</Label>
              <p className={styles.time}>
                Time
                <span className={styles.timeSelect}>
                  <input
                    type="time"
                    value={startTime}
                    min="00:00"
                    max="23:59"
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  →
                  <input
                    type="time"
                    value={endTime}
                    min="00:00"
                    max="23:59"
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </span>
              </p>
            </Flex>
            <Flex direction="column" gap="2">
              <Label>Repeat</Label>
              <div className={styles.daySelect}>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      days[6] = e.target.checked;
                      setDays(days);
                    }}
                  />
                  <span>Su</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      days[0] = e.target.checked;
                      setDays(days);
                    }}
                  />
                  <span>M</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      days[1] = e.target.checked;
                      setDays(days);
                    }}
                  />
                  <span>Tu</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      days[2] = e.target.checked;
                      setDays(days);
                    }}
                  />
                  <span>W</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      days[3] = e.target.checked;
                      setDays(days);
                    }}
                  />
                  <span>Th</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      days[4] = e.target.checked;
                      setDays(days);
                    }}
                  />
                  <span>F</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      days[5] = e.target.checked;
                      setDays(days);
                    }}
                  />
                  <span>Sa</span>
                </label>
              </div>
            </Flex>
            <Flex direction="column" gap="2">
              <Label>Description</Label>
              <Input
                type="text"
                placeholder="Enter a description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </Flex>
            <Button variant="solid" onClick={() => save()}>
              Add
              <ArrowRight />
            </Button>
          </Flex>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
