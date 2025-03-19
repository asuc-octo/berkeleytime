import { ReactNode, useMemo, useState } from "react";

import { ArrowRight, Trash, Xmark } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button, Dialog, Flex, IconButton } from "@repo/theme";

import { useDeleteSchedule, useUpdateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";
import { removeRecentSchedule } from "@/lib/recent";

import styles from "./EditDialog.module.scss";

interface EditDialogProps {
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function EditDialog({ children }: EditDialogProps) {
  const { schedule } = useSchedule();
  const [updateSchedule, { loading }] = useUpdateSchedule();
  const [deleteSchedule] = useDeleteSchedule();
  const navigate = useNavigate();

  const [name, setName] = useState(schedule.name);

  const saved = useMemo(() => schedule.name === name.trim(), [schedule, name]);

  const save = () => {
    const value = name.trim();

    setName(value);

    updateSchedule(
      schedule._id,
      { name },
      { optimisticResponse: { updateSchedule: { ...schedule, name } } }
    );
  };

  const remove = async () => {
    removeRecentSchedule(schedule);

    await deleteSchedule(schedule._id);

    navigate("/schedules");
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <Flex p="5" direction="column" gap="5">
            <Flex align="start" gap="5">
              <Flex direction="column" gap="1" flexGrow="1">
                <Dialog.Title asChild>
                  <p className={styles.title}>Edit schedule</p>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className={styles.description}>
                    Update or delete the schedule
                  </p>
                </Dialog.Description>
              </Flex>
              <Button onClick={() => remove()}>
                <Trash />
                Delete
              </Button>
              <Dialog.Close asChild>
                <IconButton>
                  <Xmark />
                </IconButton>
              </Dialog.Close>
            </Flex>
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
          </Flex>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
