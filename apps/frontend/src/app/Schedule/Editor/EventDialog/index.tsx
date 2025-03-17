import { ReactNode, useState } from "react";

import { ArrowRight, Xmark } from "iconoir-react";

import { Button, Dialog, IconButton } from "@repo/theme";

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
  const [description, setDescription] = useState("Custom event");
  const [startTime, setStartTime] = useState("11:30");
  const [endTime, setEndTime] = useState("15:50");
  const [days, setDays] = useState([false, false, false, false, false, false, false]);

  const save = () => {
    if (title === "") return;
    if (parseInt(startTime.replace(':', ''), 10) >= parseInt(endTime.replace(':', ''), 10)) return;
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
        events: schedule.events ? [...(schedule.events.map((e) => {
          const { _id, __typename, ...rest} = e as any || {};
          return rest;
        })), event] : [event],
      },
      {
        optimisticResponse: {
          updateSchedule: {
            ...schedule,
            events: schedule.events
              ? [...schedule.events, { ...event, _id: temporaryIdentifier }]
              : [{ ...event, _id: temporaryIdentifier }],
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
        <Dialog.Card className={styles.content}>
          <div className={styles.header}>
            <div className={styles.text}>
              <Dialog.Title asChild>
                <p className={styles.title}>Add event</p>
              </Dialog.Title>
              <Dialog.Description asChild>
                <p className={styles.description}>
                  Insert a custom event in your schedule
                </p>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <IconButton>
                <Xmark />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className={styles.column}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter title"
            />
            <label className={styles.label}>Days</label>
            <div className={styles.daySelect}>
              <p>Su<input type="checkbox" onChange={(e) => {
                days[6] = e.target.checked;
                setDays(days);
              }}/></p>
              <p>M<input type="checkbox" onChange={(e) => {
                days[0] = e.target.checked;
                setDays(days);
              }}/></p>
              <p>Tu<input type="checkbox" onChange={(e) => {
                days[1] = e.target.checked;
                setDays(days);
              }}/></p>
              <p>W<input type="checkbox" onChange={(e) => {
                days[2] = e.target.checked;
                setDays(days);
              }}/></p>
              <p>Th<input type="checkbox" onChange={(e) => {
                days[3] = e.target.checked;
                setDays(days);
              }}/></p>
              <p>F<input type="checkbox" onChange={(e) => {
                days[4] = e.target.checked;
                setDays(days);
              }}/></p>
              <p>Sa<input type="checkbox" onChange={(e) => {
                days[5] = e.target.checked;
                setDays(days);
              }}/></p>
            </div>
            <label className={styles.label}>Time</label>
            <p className={styles.time}>Start time<input
              type="time"
              value={startTime}
              min="00:00"
              max="23:59"
              onChange={(e) => setStartTime(e.target.value)}
            /></p>
            <p className={styles.time}>End time <input
              type="time"
              value={endTime}
              min="00:00"
              max="23:59"
              onChange={(e) => setEndTime(e.target.value)}
            /></p>
            <label className={styles.label}>Description</label>
            <input
              type="text"
              className={styles.input}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Button onClick={() => save()}>
              Save
              <ArrowRight />
            </Button>
          </div>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
