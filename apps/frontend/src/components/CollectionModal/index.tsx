import { FormEvent, useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { Button, Dialog, Input } from "@repo/theme";

import styles from "./CollectionModal.module.scss";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  existingNames?: string[];
  mode?: "create" | "rename";
  initialName?: string;
}

export function CollectionModal({
  isOpen,
  onClose,
  onSubmit,
  existingNames = [],
  mode = "create",
  initialName,
}: CollectionModalProps) {
  const originalName = initialName ?? "";
  const [name, setName] = useState("");

  const hasConflict = existingNames.some(
    (existing) => existing.toLowerCase() === name.trim().toLowerCase()
  );

  const isUnchanged =
    mode === "rename" && name.trim() === originalName;

  const hasError = hasConflict || isUnchanged;

  const isCreate = mode === "create";
  const title = isCreate ? "New collection" : "Rename collection";
  const submitLabel = isCreate ? "Create" : "Rename";

  useEffect(() => {
    if (isOpen) {
      setName("");
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || hasError) return;
    onSubmit(name.trim());
    setName("");
    onClose();
  };

  const handleClose = () => {
    setName("");
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
                <label className={styles.label} htmlFor="collection-name">
                  Collection name
                </label>
                <motion.div
                  animate={hasError ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Input
                    id="collection-name"
                    className={`${styles.input} ${hasError ? styles.inputError : ""}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="New collection name"
                    autoFocus
                  />
                </motion.div>
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
                    {isUnchanged && !hasConflict && (
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
              </div>
            </form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || hasError}>
              {submitLabel}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
