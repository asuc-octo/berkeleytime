import { useState } from "react";

import { Xmark } from "iconoir-react";

import { Flex, IconButton, Input } from "@repo/theme";

import ColorSelector from "@/components/ColorSelector";
import { IScheduleEvent } from "@/lib/api";
import { Color } from "@/lib/generated/graphql";

import styles from "./Event.module.scss";

interface EventProps {
  event: IScheduleEvent;
  onDelete: (event: IScheduleEvent) => void;
  onColorSelect: (c: Color) => void;
  onEventTitleChange: (id: string, title: string) => void;
}

export default function Event({
  event,
  onDelete,
  onColorSelect,
  onEventTitleChange,
}: EventProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(event.title);

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

  return (
    <div className={styles.root} data-draggable>
      <div
        className={styles.border}
        style={{ backgroundColor: `var(--${event.color}-500)` }}
      />
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
          <Flex direction="row" width="80px" justify="between" align="center">
            <ColorSelector
              selectedColor={event.color!}
              onColorSelect={onColorSelect}
            />
            <IconButton onClick={() => onDelete(event)}>
              <Xmark />
            </IconButton>
          </Flex>
        </div>
      </div>
    </div>
  );
}
