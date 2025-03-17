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

  const [title, setTitle] = useState("Test");
  const [description] = useState("Test event");
  const [startTime] = useState("11:30");
  const [endTime] = useState("15:50");
  const [days] = useState([false, true, false, true, false, true, false]);

  const save = () => {
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
        events: schedule.events ? [...schedule.events, event] : [event],
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
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
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
