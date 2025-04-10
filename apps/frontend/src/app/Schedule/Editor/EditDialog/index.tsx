import { ReactNode, useMemo, useState } from "react";

import { ArrowRight, Trash, Xmark } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
} from "@repo/theme";

import { useDeleteSchedule, useUpdateSchedule } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";
import { RecentType, removeRecent } from "@/lib/recent";

interface EditDialogProps {
  children: ReactNode;
}

// TODO: Collaborative editing
// TODO: Invite collaborators

export default function EditDialog({ children }: EditDialogProps) {
  const { schedule } = useSchedule();
  const [updateSchedule, { loading }] = useUpdateSchedule();
  const [deleteSchedule, { loading: pending }] = useDeleteSchedule();
  const navigate = useNavigate();

  const [name, setName] = useState(schedule.name);

  const [open, setOpen] = useState(false);

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

  // TODO: Confirmation dialog
  const remove = async () => {
    removeRecent(RecentType.Schedule, schedule);

    await deleteSchedule(schedule._id);

    navigate("/schedules");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && (loading || pending)) return;

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
                  <Heading>Edit schedule</Heading>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <Text>Update or delete the schedule</Text>
                </Dialog.Description>
              </Flex>
              <Flex gap="3">
                <Button onClick={() => remove()} disabled={loading || pending}>
                  <Trash />
                  Delete
                </Button>
                <Dialog.Close asChild>
                  <IconButton disabled={loading || pending}>
                    <Xmark />
                  </IconButton>
                </Dialog.Close>
              </Flex>
            </Flex>
            <Input
              disabled={loading || pending}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Button
              variant="solid"
              disabled={saved || loading || pending}
              onClick={() => save()}
            >
              Save
              <ArrowRight />
            </Button>
          </Flex>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
