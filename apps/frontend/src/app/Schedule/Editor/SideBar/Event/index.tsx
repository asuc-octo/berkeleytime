import { useState } from "react";

import { EditPencil, EyeClosed, Trash } from "iconoir-react";

import { Input } from "@repo/theme";

import EventDialog from "@/app/Schedule/Editor/EventDialog";
import { acceptedColors } from "@/app/Schedule/schedule";
import { ActionMenu } from "@/components/ActionMenu";
import { MenuItem } from "@/components/ActionMenu";
import { ColorDot } from "@/components/ColorDot";
import { IScheduleEvent } from "@/lib/api";
import { capitalizeColor } from "@/lib/colors";
import { Color } from "@/lib/generated/graphql";

import styles from "./Event.module.scss";

interface EventProps {
  event: IScheduleEvent;
  onDelete: (event: IScheduleEvent) => void;
  onColorSelect: (c: Color) => void;
  onEventTitleChange: (id: string, title: string) => void;
  onHideChange: (hidden: boolean) => void;
}

export default function Event({
  event,
  onDelete,
  onColorSelect,
  onEventTitleChange,
  onHideChange,
}: EventProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(event.title);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(event.title);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() !== event.title) {
      onEventTitleChange(event._id, editValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(event.title);
    }
  };

  // Color submenu
  const colorSubItems: MenuItem[] = acceptedColors.map((c) => ({
    name: capitalizeColor(c as any),
    icon: <ColorDot color={c as any} />,
    onClick: () => onColorSelect(c),
  }));

  const menuItems: MenuItem[] = [
    {
      name: "Change color",
      icon: <EditPencil width={18} height={18} />,
      subItems: colorSubItems,
    },
    {
      name: "Edit",
      icon: <EditPencil width={18} height={18} />,
      onClick: () => setEditDialogOpen(true),
    },
    {
      name: event.hidden ? "Show event" : "Hide event",
      icon: <EyeClosed width={18} height={18} />,
      onClick: () => onHideChange(!event.hidden),
    },
    {
      name: "Delete",
      icon: <Trash width={18} height={18} />,
      onClick: () => onDelete(event),
      isDelete: true,
    },
  ];

  return (
    <div className={styles.root} data-draggable>
      {!event.hidden && (
        <div
          className={styles.border}
          style={{ backgroundColor: `var(--${event.color}-500)` }}
        />
      )}
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.row}>
            {/* <div className={styles.icon}>
              <ArrowSeparateVertical />
            </div> */}
            <div className={styles.text}>
              {isEditing ? (
                <Input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className={styles.titleInput}
                  autoFocus
                />
              ) : (
                <p
                  className={styles.heading}
                  onClick={handleClick}
                  style={{ cursor: "pointer" }}
                >
                  {event.title}
                </p>
              )}
              <p className={styles.description}>{event.description}</p>
            </div>
          </div>
          <ActionMenu menuItems={menuItems} asIcon />
        </div>
      </div>
      <EventDialog
        event={
          editDialogOpen
            ? {
                ...event,
                days: [...event.days.slice(5, 7), ...event.days.slice(0, 5)],
              }
            : undefined
        }
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      >
        <div style={{ display: "none" }} />
      </EventDialog>
    </div>
  );
}
