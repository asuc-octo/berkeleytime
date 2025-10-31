import { ChangeEventHandler, useEffect, useState } from "react";

import { Plus, Trash } from "iconoir-react";

import { Button, Color, Dialog, Flex, IconButton, Input } from "@repo/theme";

import ColorSelector from "@/components/ColorSelector";
import { ILabel } from "@/lib/api";

import styles from "./LabelMenu.module.scss";

type LabelMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: ILabel[];
  onLabelsChange: (labels: ILabel[]) => void;
};

type LabelRowProps = {
  onTextChange: ChangeEventHandler<HTMLInputElement>;
  onDelete?: () => void;
  label: ILabel;
  onColorSelect: (color: Color) => void;
  handleAdd: () => void;
};

const LabelRow = ({
  onTextChange,
  onDelete,
  label,
  onColorSelect,
  handleAdd,
}: LabelRowProps) => {
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
        <ColorSelector
          selectedColor={label ? (label.color as Color) : Color.gray}
          onColorSelect={onColorSelect}
          usePortal={false}
        />
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
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Overlay />
      <Dialog.Card className={styles.labelDialog}>
        <Dialog.Header title="Labels" hasCloseButton />

        <Dialog.Body className={styles.body}>
          <Flex direction="column" width="100%">
            {editingLabels.map((label, i) => (
              <LabelRow
                key={i}
                onTextChange={(e) => {
                  const updatedLabels = [...editingLabels];
                  updatedLabels[i] = {
                    ...updatedLabels[i],
                    name: e.target.value,
                  };
                  setEditingLabels(updatedLabels);
                }}
                onDelete={() => {
                  const updatedLabels = editingLabels.filter(
                    (_, index) => index !== i
                  );
                  setEditingLabels(updatedLabels);
                }}
                label={label}
                onColorSelect={(color) => handleColorSelect(i, color)}
                handleAdd={() => {}}
              />
            ))}
            <LabelRow
              onTextChange={(e) => {
                const tmp = { ...tmpLabel, name: e.target.value };
                setTmpLabel(tmp);
                setDuplicateError(false); // Clear error when typing
              }}
              label={tmpLabel}
              onColorSelect={(color) => {
                const tmp = { ...tmpLabel, color };
                setTmpLabel(tmp);
              }}
              handleAdd={() => {
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
              }}
            />
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
