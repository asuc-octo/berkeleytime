import { ReactNode } from "react";

import { ArrowRight, Xmark } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button, Dialog, IconButton } from "@repo/theme";

import { useCreateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";

import styles from "./CloneDialog.module.scss";

interface CloneDialogProps {
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function CloneDialog({ children }: CloneDialogProps) {
  const { schedule } = useSchedule();
  const navigate = useNavigate();

  const [createSchedule] = useCreateSchedule();

  const confirm = async () => {
    const { data } = await createSchedule({
      year: schedule.year,
      semester: schedule.semester,
      classes: schedule.classes.map((_class) => ({
        subject: _class.class.subject,
        courseNumber: _class.class.courseNumber,
        number: _class.class.number,
        sectionIds: _class.selectedSections.map((s) => s.sectionId),
      })),
      events: schedule.events,
      name: `${schedule.name} (copy)`,
      sessionId: schedule.sessionId
    });

    if (!data) return;

    navigate(`/schedules/${data?.createSchedule._id}`);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Content className={styles.content}>
        <div className={styles.header}>
          <div className={styles.text}>
            <Dialog.Title asChild>
              <p className={styles.title}>Clone schedule</p>
            </Dialog.Title>
            <Dialog.Description asChild>
              <p className={styles.description}>
                Create a copy of this schedule
              </p>
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <IconButton>
              <Xmark />
            </IconButton>
          </Dialog.Close>
        </div>
        <Button onClick={() => confirm()} variant="solid">
          Confirm
          <ArrowRight />
        </Button>
      </Dialog.Content>
    </Dialog.Root>
  );
}
