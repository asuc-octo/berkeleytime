import { ChangeEventHandler, useEffect, useState } from "react";

import { NavArrowDown, Plus, Trash } from "iconoir-react";

import { Button, Color, Dialog, Flex, IconButton, Input } from "@repo/theme";

import { ILabel } from "@/lib/api";

import styles from "./LabelMenu.module.scss";

type LabelMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: ILabel[];
  onLabelsChange: (labels: ILabel[]) => void;
};

const LabelColor = (props: { color: Color }) => {
  return (
    <div
      className={styles.colorLabel}
      style={{
        backgroundColor: `var(--${props.color}-500-20)`,
        borderColor: `var(--${props.color}-500)`,
      }}
    ></div>
  );
};

const LabelRow = (
  onTextChange: ChangeEventHandler<HTMLInputElement>,
  onDelete: () => void,
  label: ILabel,
  showColorPicker: boolean,
  onColorSelectClick: () => void,
  onColorSelect: (color: Color) => void,
  handleAdd: () => void
) => {
  return (
    <Flex
      direction="column"
      width="100%"
      gap="4px"
      className={styles.rowContainer}
    >
      <Flex
        direction="row"
        width="100%"
        gap="12px"
        align="center"
        className={styles.labelRow}
      >
        <div className={styles.colorSelect} onClick={onColorSelectClick}>
          {label ? (
            <LabelColor color={label.color as Color} />
          ) : (
            <LabelColor color={Color.gray} />
          )}
          <NavArrowDown />
        </div>
        <Input
          value={label ? label.name : ""}
          onChange={onTextChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder={"Enter label's name..."}
          className={styles.labelInput}
          style={{ flex: 1 }}
        />
        {onDelete ? (
          <IconButton onClick={onDelete} style={{ border: "none" }}>
            <Trash />
          </IconButton>
        ) : (
          <IconButton onClick={handleAdd} style={{ border: "none" }}>
            <Plus />
          </IconButton>
        )}
      </Flex>
      {showColorPicker && (
        <div className={styles.colorPicker}>
          {Object.values(Color).map((color) => (
            <div
              key={color}
              className={styles.colorOption}
              style={{
                backgroundColor: `var(--${color}-500-20)`,
                border:
                  label?.color === color
                    ? "2px solid var(--blue-500)"
                    : `1px solid var(--${color}-500)`,
              }}
              onClick={() => onColorSelect?.(color)}
            />
          ))}
        </div>
      )}
    </Flex>
  );
};

export default function LabelMenu({
  open,
  onOpenChange,
  labels,
  onLabelsChange,
}: LabelMenuProps) {
  const [editingLabels, setEditingLabels] = useState<ILabel[]>(labels);
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null);
  const [tmpLabel, setTmpLabel] = useState<ILabel>({
    name: "",
    color: Color.gray,
  });
  const [duplicateError, setDuplicateError] = useState<boolean>(false);

  useEffect(() => {
    setEditingLabels(labels);
  }, [labels]);

  const handleSave = () => {
    const tmpEditingLabels = editingLabels;
    if (tmpLabel.name.trim()) {
      tmpEditingLabels.push(tmpLabel);
      setTmpLabel({ name: "", color: Color.gray });
    }
    onLabelsChange(
      tmpEditingLabels
        .filter((label) => label.name)
        .map((l) => {
          return {
            name: l.name,
            color: l.color,
          };
        })
    );
    onOpenChange(false);
  };

  const handleCancel = () => {
    setEditingLabels(labels);
    onOpenChange(false);
    setTmpLabel({ name: "", color: Color.gray });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingLabels(labels);
      setTmpLabel({ name: "", color: Color.gray });
    }
    onOpenChange(open);
  };

  const handleColorSelect = (labelIndex: number, color: Color) => {
    const updatedLabels = [...editingLabels];
    updatedLabels[labelIndex] = { ...updatedLabels[labelIndex], color };
    setEditingLabels(updatedLabels);
    setShowColorPicker(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(`.${styles.colorSelect}`) &&
        !target.closest(`.${styles.colorPicker}`)
      ) {
        setShowColorPicker(null);
      }
    };

    if (showColorPicker !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showColorPicker]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Overlay />
      <Dialog.Card className={styles.labelDialog}>
        <Dialog.Header title="Labels" hasCloseButton />

        <Dialog.Body className={styles.body}>
          <Flex direction="column" width="100%">
            {editingLabels.map((label, i) =>
              LabelRow(
                (e) => {
                  const updatedLabels = [...editingLabels];
                  updatedLabels[i] = {
                    ...updatedLabels[i],
                    name: e.target.value,
                  };
                  setEditingLabels(updatedLabels);
                },
                () => {
                  const updatedLabels = editingLabels.filter(
                    (_, index) => index !== i
                  );
                  setEditingLabels(updatedLabels);
                },
                label,
                showColorPicker === i,
                () => setShowColorPicker(showColorPicker === i ? null : i),
                (color) => handleColorSelect(i, color),
                () => {}
              )
            )}
            {LabelRow(
              (e) => {
                const tmp = { ...tmpLabel, name: e.target.value };
                setTmpLabel(tmp);
                setDuplicateError(false); // Clear error when typing
              },
              () => {},
              tmpLabel,
              showColorPicker === -1,
              () => setShowColorPicker(showColorPicker === -1 ? null : -1),
              (color) => {
                const tmp = { ...tmpLabel, color };
                setTmpLabel(tmp);
                setShowColorPicker(null);
              },
              () => {
                if (tmpLabel.name.trim()) {
                  const labelExists = editingLabels.some(
                    (label) =>
                      label.name === tmpLabel.name &&
                      label.color === tmpLabel.color
                  );

                  if (!labelExists) {
                    setEditingLabels((prev) => [...prev, tmpLabel]);
                    setTmpLabel({ name: "", color: Color.gray });
                    setDuplicateError(false);
                  } else {
                    setDuplicateError(true);
                  }
                }
              }
            )}
            {duplicateError && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                A label with that name and color already exists.
              </div>
            )}
          </Flex>
        </Dialog.Body>
        <Dialog.Footer justify="end">
          <Flex direction="row" gap="2">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </Flex>
        </Dialog.Footer>
      </Dialog.Card>
    </Dialog.Root>
  );
}
