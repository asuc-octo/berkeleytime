import { ComponentPropsWithRef, useState } from "react";

import { EditPencil } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button, Dialog, Input } from "@repo/theme";

import { BubbleCard, MenuItem } from "@/components/BubbleCard";
import { useUpdateSchedule } from "@/hooks/api";
import { IScheduleListSchedule } from "@/lib/api";

import ScheduleSummary from "../ScheduleSummary";

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
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(name);

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

  const menuItems: MenuItem[] = [
    {
      name: "Rename schedule",
      icon: <EditPencil width={18} height={18} />,
      onClick: handleRename,
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
    </>
  );
}
