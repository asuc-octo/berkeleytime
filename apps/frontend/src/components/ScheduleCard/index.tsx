import { ComponentPropsWithRef, useState } from "react";

import { EditPencil, Trash } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button, Dialog, Input } from "@repo/theme";

import { BubbleCard, MenuItem } from "@/components/BubbleCard";
import { useDeleteSchedule, useUpdateSchedule } from "@/hooks/api";
import { IScheduleListSchedule } from "@/lib/api";

import ScheduleSummary from "../ScheduleSummary";
import { DeleteScheduleDialog } from "./DeleteScheduleDialog";

interface ScheduleProps {
  _id: string;
  name: string;
  schedule: IScheduleListSchedule;
}

export default function ScheduleCard({
  _id,
  name,
  schedule,
  ...props
}: ScheduleProps & Omit<ComponentPropsWithRef<"div">, keyof ScheduleProps>) {
  const navigate = useNavigate();
  const [updateSchedule] = useUpdateSchedule();
  const [deleteSchedule] = useDeleteSchedule();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleRename = () => {
    setIsRenameDialogOpen(true);
    setRenameValue(name);
  };

  const handleRenameSubmit = () => {
    const trimmedValue = renameValue.trim();
    if (trimmedValue && trimmedValue !== name) {
      updateSchedule(_id, { name: trimmedValue });
    }
    setIsRenameDialogOpen(false);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteSchedule(_id);
    navigate("/schedules");
  };

  const menuItems: MenuItem[] = [
    {
      name: "Rename schedule",
      icon: <EditPencil width={18} height={18} />,
      onClick: handleRename,
    },
    {
      name: "Delete schedule",
      icon: <Trash width={18} height={18} />,
      onClick: handleDelete,
      isDelete: true,
    },
  ];

  const description = schedule?.classes
    ? `${schedule.classes.length} classes`
    : undefined;

  const handleCardClick = () => {
    navigate(`/schedules/${_id}`);
  };

  // Filter out props that might conflict with BubbleCard
  const { color: _, ...bubbleCardProps } = props as any;

  return (
    <>
      <BubbleCard
        title={name}
        description={description}
        menuItems={menuItems}
        onClick={handleCardClick}
        showCards={true}
        width={250}
        height={300}
        cssColor={"var(--background-color)"}
        {...bubbleCardProps}
      >
        <ScheduleSummary schedule={schedule} />
      </BubbleCard>
      <Dialog.Root
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Card>
            <Dialog.Header title="Rename schedule" hasCloseButton />
            <Dialog.Body>
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameSubmit();
                  }
                }}
                autoFocus
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="secondary"
                onClick={() => setIsRenameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenameSubmit}
                disabled={!renameValue.trim() || renameValue.trim() === name}
              >
                Rename
              </Button>
            </Dialog.Footer>
          </Dialog.Card>
        </Dialog.Portal>
      </Dialog.Root>
      <DeleteScheduleDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Schedule"
        message={
          <>
            This schedule will be permanently deleted and <br />
            cannot be recovered.
          </>
        }
        onConfirm={handleDeleteConfirm}
        confirmText="Yes, delete"
        cancelText="No, keep my schedule"
      />
    </>
  );
}
