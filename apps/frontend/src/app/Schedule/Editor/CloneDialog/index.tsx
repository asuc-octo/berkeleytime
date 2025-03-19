import { ReactNode, useState } from "react";

import { ArrowRight, Xmark } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button, Dialog, Flex, IconButton } from "@repo/theme";

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

  const [name, setName] = useState(`${schedule.name} (copy)`);

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
      events: schedule.events.map((e) => {
        // TODO: Clean up

        // eslint-disable-next-line
        const { _id, __typename, ...rest } = (e as any) || {};

        return rest;
      }),
      name: name,
      sessionId: schedule.sessionId,
    });

    if (!data) return;

    navigate(`/schedules/${data?.createSchedule._id}`);
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
                  <p className={styles.title}>Clone schedule</p>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className={styles.description}>
                    Create a copy of this schedule
                  </p>
                </Dialog.Description>
              </Flex>
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
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={() => confirm()} variant="solid">
              Confirm
              <ArrowRight />
            </Button>
          </Flex>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
