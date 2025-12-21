import { ReactNode, useEffect, useState } from "react";

import { ArrowRight, Xmark } from "iconoir-react";

import {
  Button,
  Color,
  DaySelect,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Input,
  Label,
  Text,
} from "@repo/theme";

import { acceptedColors } from "@/app/Schedule/schedule";
import ColorSelector from "@/components/ColorSelector";
import { useUpdateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";
import { IScheduleEvent } from "@/lib/api";

import styles from "./EventDialog.module.scss";

interface EventDialogProps {
  children: ReactNode;
  event?: IScheduleEvent;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function EventDialog({
  children,
  event,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EventDialogProps) {
  const { schedule } = useSchedule();
  const [internalOpen, setInternalOpen] = useState(false);
  const [updateSchedule] = useUpdateSchedule();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

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
  const [color, setColor] = useState<Color>(Color.Gray);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime("11:30");
    setEndTime("15:50");
    setDays([false, false, false, false, false, false, false]);
    setColor(Color.Gray);
  };

  // Populate form when event prop is provided
  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setStartTime(event.startTime || "11:30");
      setEndTime(event.endTime || "15:50");
      // Convert days array (Sunday first) to our format (Monday first)
      if (event.days && event.days.length === 7) {
        setDays([...event.days.slice(1), event.days[0]]);
      }
      setColor(event.color || Color.Gray);
    } else {
      resetForm();
    }
  }, [event]);

  const save = () => {
    if (title === "") return;
    if (
      parseInt(startTime.replace(":", ""), 10) >=
      parseInt(endTime.replace(":", ""), 10)
    )
      return;

    const eventData = {
      title,
      description,
      startTime,
      endTime,
      days: days.slice(1).concat(days[0]), // Convert back to Sunday-first format
      color,
    };

    if (event) {
      // Edit mode: replace the existing event
      const updatedEvents = schedule.events
        ? schedule.events.map((e) => {
            if (e._id === event._id) {
              return eventData;
            }
            // eslint-disable-next-line
            const { _id, __typename, ...rest } = (e as any) || {};
            return rest;
          })
        : [eventData];

      updateSchedule(
        schedule._id,
        {
          events: updatedEvents,
        },
        {
          optimisticResponse: {
            updateSchedule: {
              ...schedule,
              events: schedule.events
                ? schedule.events.map((e) =>
                    e._id === event._id ? { ...eventData, _id: event._id } : e
                  )
                : [{ ...eventData, _id: event._id }],
            },
          },
        }
      );
    } else {
      // Create mode: add new event
      const temporaryIdentifier = crypto.randomUUID();

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
                eventData,
              ]
            : [eventData],
        },
        {
          optimisticResponse: {
            updateSchedule: {
              ...schedule,
              events: schedule.events
                ? [
                    ...schedule.events,
                    {
                      ...eventData,
                      _id: temporaryIdentifier,
                    },
                  ]
                : [
                    {
                      ...eventData,
                      _id: temporaryIdentifier,
                    },
                  ],
            },
          },
        }
      );
    }

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <Dialog.Header>
            <Flex direction="column" gap="1" flexGrow="1">
              <Dialog.Title asChild>
                <Heading>{event ? "Edit event" : "Add a custom event"}</Heading>
              </Dialog.Title>
              <Dialog.Description asChild>
                <Text>
                  {event
                    ? "Update your custom event"
                    : "Insert a custom event in your schedule"}
                </Text>
              </Dialog.Description>
            </Flex>
            <Dialog.Close asChild>
              <IconButton>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </Dialog.Header>
          <Dialog.Body gap="3">
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
            <Flex direction="column" gap="2" width="300px">
              <Label>Repeat</Label>
              <DaySelect
                days={days}
                updateDays={(v) => setDays([...v])}
                size="sm"
              />
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
            <Flex direction="column" gap="2">
              <Label>Color</Label>
              <ColorSelector
                selectedColor={color}
                allowedColors={acceptedColors}
                onColorSelect={setColor}
                usePortal={false}
              />
            </Flex>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => save()}>
              {event ? "Save" : "Add"}
              <ArrowRight />
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
