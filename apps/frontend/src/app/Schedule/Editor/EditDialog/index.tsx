import { ReactNode, useMemo, useState } from "react";

import { ArrowRight, Xmark } from "iconoir-react";

import { Button, Dialog, IconButton } from "@repo/theme";

import { useUpdateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";

import styles from "./EditDialog.module.scss";

interface EditDialogProps {
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function EditDialog({ children }: EditDialogProps) {
  const { schedule } = useSchedule();
  const [updateSchedule, { loading }] = useUpdateSchedule();

  const [name, setName] = useState(schedule.name);

  const saved = useMemo(() => schedule.name === name.trim(), [schedule, name]);

  const save = () => {
    const value = name.trim();

    setName(value);
    updateSchedule(schedule._id, { name });
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Content className={styles.content}>
        <div className={styles.header}>
          <div className={styles.text}>
            <Dialog.Title asChild>
              <p className={styles.title}>Edit schedule</p>
            </Dialog.Title>
            <Dialog.Description asChild>
              <p className={styles.description}>
                Update the name of your schedule
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
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button disabled={saved || loading} onClick={() => save()}>
            Save
            <ArrowRight />
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
