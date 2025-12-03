import { FormEvent, useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { Button, Dialog } from "@repo/theme";

import CollectionNameInput from "@/components/CollectionNameInput";

import styles from "./CollectionModal.module.scss";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string | null) => void;
  existingNames?: string[];
  mode?: "create" | "rename" | "color";
  initialName?: string;
  initialColor?: string | null;
}

export function CollectionModal({
  isOpen,
  onClose,
  onSubmit,
  existingNames = [],
  mode = "create",
  initialName,
  initialColor = null,
}: CollectionModalProps) {
  const originalName = initialName ?? "";
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(initialColor);

  const hasConflict = existingNames.some(
    (existing) => existing.toLowerCase() === name.trim().toLowerCase()
  );
  const isTooLong = name.trim().length > 50;

  const isUnchanged = mode === "rename" && name.trim() === originalName;

  const isColorMode = mode === "color";
  const hasError = !isColorMode && (hasConflict || isTooLong || isUnchanged);

  const title =
    mode === "create"
      ? "New collection"
      : mode === "rename"
        ? "Rename collection"
        : "Edit color";
  const submitLabel =
    mode === "create" ? "Create" : mode === "rename" ? "Rename" : "Save";

  useEffect(() => {
    if (isOpen) {
      setName(mode === "rename" ? "" : (initialName ?? ""));
      setColor(mode === "create" ? null : initialColor);
    }
  }, [isOpen, initialName, initialColor, mode]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!isColorMode && (!name.trim() || hasError)) return;
    onSubmit(isColorMode ? originalName : name.trim(), color);
    setName("");
    setColor(null);
    onClose();
  };

  const handleClose = () => {
    setName("");
    setColor(null);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <Dialog.Header title={title} hasCloseButton />
          <Dialog.Body className={styles.body}>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                {!isColorMode && (
                  <label className={styles.label} htmlFor="collection-name">
                    Collection name
                  </label>
                )}
                <motion.div
                  animate={hasError ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <CollectionNameInput
                    value={isColorMode ? originalName : name}
                    onChange={setName}
                    onSubmit={handleSubmit}
                    color={color}
                    onColorChange={setColor}
                    placeholder={
                      mode === "rename" ? originalName : "New collection name"
                    }
                    hasError={hasError}
                    autoFocus={!isColorMode}
                    disabled={isColorMode}
                  />
                </motion.div>
                {!isColorMode && (
                  <span className={styles.error}>
                    <AnimatePresence mode="wait">
                      {hasConflict && (
                        <motion.span
                          key="conflict"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                        >
                          Collection with the same name already exists.
                        </motion.span>
                      )}
                      {isTooLong && !hasConflict && (
                        <motion.span
                          key="toolong"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                        >
                          Collection name must be 50 characters or less.
                        </motion.span>
                      )}
                      {isUnchanged && !hasConflict && !isTooLong && (
                        <motion.span
                          key="unchanged"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                        >
                          Enter a new name for this collection.
                        </motion.span>
                      )}
                    </AnimatePresence>
                    &nbsp;
                  </span>
                )}
              </div>
            </form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={!isColorMode && (!name.trim() || hasError)}
            >
              {submitLabel}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
