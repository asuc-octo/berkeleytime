import { useRef, useState } from "react";

import classNames from "classnames";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowUp, Bookmark, BookmarkSolid, PinSolid, Plus } from "iconoir-react";
import { Popover } from "radix-ui";

import { IconButton } from "@repo/theme";

import CollectionNameInput from "@/components/CollectionNameInput";
import {
  ALL_SAVED_COLLECTION_NAME,
  Collection,
} from "@/types/collection";

import styles from "./BookmarkPopover.module.scss";

interface BookmarkPopoverProps {
  disabled?: boolean;
  // Future: onCollectionChange callbacks for backend integration
}

export default function BookmarkPopover({ disabled = false }: BookmarkPopoverProps) {
  const [savedCollections, setSavedCollections] = useState<Set<string>>(
    new Set()
  );

  // TEMPORARY: In production, unpinned collections should be sorted by last edited date.
  // For now, we use createdAt to sort newest first among unpinned collections.
  const initialCollectionIds = useRef(
    new Set(["1", "2", "3", "4", "5"])
  );

  const [collections, setCollections] = useState<Collection[]>([
    { id: "1", name: ALL_SAVED_COLLECTION_NAME, classCount: 4, color: null, isPinned: false, createdAt: 0 },
    { id: "2", name: "Fall 2025", classCount: 8, color: null, isPinned: true, createdAt: 1 },
    { id: "3", name: "Spring 2026", classCount: 12, color: null, isPinned: false, createdAt: 2 },
    { id: "4", name: "Breadths", classCount: 5, color: null, isPinned: true, createdAt: 3 },
    {
      id: "5",
      name: "Testing this really long name for a collection, Major Requirements",
      classCount: 15,
      color: null,
      isPinned: false,
      createdAt: 4,
    },
  ]);

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState<string | null>(null);

  const existingNames = collections.map((c) => c.name.toLowerCase());
  const hasConflict =
    newCollectionName.trim() !== "" &&
    existingNames.includes(newCollectionName.trim().toLowerCase());

  // Sort: "All saved" first, then pinned, then unpinned (newest first)
  const sortedCollections = [...collections].sort((a, b) => {
    if (a.name === ALL_SAVED_COLLECTION_NAME) return -1;
    if (b.name === ALL_SAVED_COLLECTION_NAME) return 1;
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // For unpinned items, sort by createdAt descending (newest first)
    if (!a.isPinned && !b.isPinned) return b.createdAt - a.createdAt;
    return 0;
  });

  const handleSubmitNewCollection = () => {
    if (!newCollectionName.trim() || hasConflict) return;

    const trimmedName = newCollectionName.trim();
    const newId = Date.now().toString();
    setCollections((prev) => [
      ...prev,
      {
        id: newId,
        name: trimmedName,
        classCount: 0,
        color: newCollectionColor,
        isPinned: false,
        createdAt: Date.now(),
      },
    ]);
    setSavedCollections((prev) => {
      const next = new Set(prev);
      next.add(ALL_SAVED_COLLECTION_NAME);
      next.add(trimmedName);
      return next;
    });
    setNewCollectionName("");
    setNewCollectionColor(null);
    setIsCreateFormOpen(false);
  };

  const resetForm = () => {
    setIsCreateFormOpen(false);
    setNewCollectionName("");
    setNewCollectionColor(null);
  };

  return (
    <Popover.Root onOpenChange={(open) => !open && resetForm()}>
      <Popover.Trigger asChild>
        <IconButton
          className={classNames(styles.bookmark, {
            [styles.active]: savedCollections.size > 0,
          })}
          disabled={disabled}
          onClick={() => {
            setSavedCollections((prev) => {
              if (prev.has(ALL_SAVED_COLLECTION_NAME)) {
                return prev;
              }
              const next = new Set(prev);
              next.add(ALL_SAVED_COLLECTION_NAME);
              return next;
            });
          }}
        >
          {savedCollections.size > 0 ? <BookmarkSolid /> : <Bookmark />}
        </IconButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className={styles.bookmarkPopover}
        >
          <div
            className={styles.collectionList}
            onClick={() => isCreateFormOpen && resetForm()}
          >
            <LayoutGroup>
              {sortedCollections.map((collection) => {
                const isSaved = savedCollections.has(collection.name);
                const isNew = !initialCollectionIds.current.has(collection.id);
                return (
                  <motion.div
                    key={collection.id}
                    layout
                    initial={isNew ? { opacity: 0, y: 50 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      layout: { type: "spring", stiffness: 500, damping: 35 },
                      opacity: { duration: 0.2 },
                      y: { type: "spring", stiffness: 400, damping: 25 },
                    }}
                    className={styles.collectionRow}
                  >
                    <span className={styles.collectionName}>
                      {collection.isPinned && (
                        <PinSolid
                          width={14}
                          height={14}
                          className={styles.pinIcon}
                        />
                      )}
                      <span>
                        {collection.name}{" "}
                        <span className={styles.collectionCount}>
                          ({collection.classCount})
                        </span>
                      </span>
                    </span>
                    <IconButton
                      className={classNames(styles.bookmark, {
                        [styles.active]: isSaved,
                      })}
                      onClick={() => {
                        setSavedCollections((prev) => {
                          const next = new Set(prev);
                          if (collection.name === ALL_SAVED_COLLECTION_NAME) {
                            if (next.has(ALL_SAVED_COLLECTION_NAME)) {
                              return new Set();
                            } else {
                              next.add(ALL_SAVED_COLLECTION_NAME);
                            }
                          } else {
                            if (next.has(collection.name)) {
                              next.delete(collection.name);
                            } else {
                              next.add(ALL_SAVED_COLLECTION_NAME);
                              next.add(collection.name);
                            }
                          }
                          return next;
                        });
                      }}
                    >
                      {isSaved ? (
                        <BookmarkSolid width={16} height={16} />
                      ) : (
                        <Bookmark width={16} height={16} />
                      )}
                    </IconButton>
                  </motion.div>
                );
              })}
            </LayoutGroup>
            <motion.div
              layout
              transition={{ layout: { type: "spring", stiffness: 500, damping: 35 } }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {isCreateFormOpen ? (
                  <motion.div
                    key="form"
                    className={styles.createCollectionForm}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className={styles.createCollectionInputRow}>
                      <CollectionNameInput
                        value={newCollectionName}
                        onChange={setNewCollectionName}
                        onSubmit={handleSubmitNewCollection}
                        color={newCollectionColor}
                        onColorChange={setNewCollectionColor}
                        hasError={hasConflict}
                        autoFocus
                      />
                      <IconButton
                        className={styles.createCollectionSubmit}
                        disabled={!newCollectionName.trim() || hasConflict}
                        onClick={handleSubmitNewCollection}
                      >
                        <ArrowUp width={16} height={16} />
                      </IconButton>
                    </div>
                    <AnimatePresence>
                      {hasConflict && (
                        <motion.span
                          className={styles.createCollectionError}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          A collection with this name already exists
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.button
                    key="button"
                    className={styles.createCollectionBtn}
                    onClick={() => setIsCreateFormOpen(true)}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Plus width={16} height={16} />
                    Create new collection
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
