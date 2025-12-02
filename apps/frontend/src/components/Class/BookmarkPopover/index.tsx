import { useCallback, useMemo, useRef, useState } from "react";

import classNames from "classnames";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  ArrowUp,
  Bookmark,
  BookmarkSolid,
  PinSolid,
  Plus,
} from "iconoir-react";
import { Popover } from "radix-ui";

import { IconButton } from "@repo/theme";

import CollectionNameInput from "@/components/CollectionNameInput";
import {
  useAddClassToCollection,
  useCreateCollection,
  useGetAllCollections,
  useRemoveClassFromCollection,
} from "@/hooks/api/collections";
import { CollectionColor, Semester } from "@/lib/generated/graphql";
import { ALL_SAVED_COLLECTION_NAME, Collection } from "@/types/collection";

import styles from "./BookmarkPopover.module.scss";

interface ClassInfo {
  year: number;
  semester: Semester;
  sessionId: string;
  subject: string;
  courseNumber: string;
  classNumber: string;
}

interface BookmarkPopoverProps {
  classInfo?: ClassInfo;
  disabled?: boolean;
}

export default function BookmarkPopover({
  classInfo,
  disabled = false,
}: BookmarkPopoverProps) {
  const { data: apiCollections, loading: collectionsLoading } =
    useGetAllCollections();
  const [createCollection] = useCreateCollection();
  const [addClassToCollection] = useAddClassToCollection();
  const [removeClassFromCollection] = useRemoveClassFromCollection();

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [mutatingCollections, setMutatingCollections] = useState<Set<string>>(
    new Set()
  );

  const collections = useMemo<Collection[]>(() => {
    const result: Collection[] = [];
    let hasAllSaved = false;

    if (apiCollections) {
      for (const c of apiCollections) {
        if (c._id && c.name) {
          if (c.isSystem && c.name === ALL_SAVED_COLLECTION_NAME) {
            hasAllSaved = true;
          }
          result.push({
            id: c._id,
            name: c.name,
            classCount: c.classes?.length ?? 0,
            isPinned: !!c.pinnedAt,
            pinnedAt: c.pinnedAt ? new Date(c.pinnedAt).getTime() : null,
            isSystem: c.isSystem,
            color: c.color as string | null,
            createdAt: c.createdAt ? new Date(c.createdAt).getTime() : 0,
          });
        }
      }
    }

    if (!hasAllSaved) {
      result.unshift({
        id: "all-saved-placeholder",
        name: ALL_SAVED_COLLECTION_NAME,
        classCount: 0,
        isPinned: false,
        pinnedAt: null,
        isSystem: true,
        color: null,
        createdAt: Date.now(),
      });
    }

    return result;
  }, [apiCollections]);

  const savedCollectionIds = useMemo<Set<string>>(() => {
    if (!apiCollections || !classInfo) return new Set();

    const saved = new Set<string>();
    for (const collection of apiCollections) {
      if (!collection._id) continue;
      const hasClass = collection.classes?.some(
        (entry) =>
          entry.class?.subject === classInfo.subject &&
          entry.class?.courseNumber === classInfo.courseNumber &&
          entry.class?.number === classInfo.classNumber
      );
      if (hasClass) {
        saved.add(collection._id);
      }
    }
    return saved;
  }, [apiCollections, classInfo]);

  const initialCollectionIds = useRef<Set<string>>(new Set());
  if (initialCollectionIds.current.size === 0 && collections.length > 0) {
    initialCollectionIds.current = new Set(collections.map((c) => c.id));
  }

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState<string | null>(
    null
  );
  const existingNames = collections.map((c) => c.name.toLowerCase());
  const hasConflict =
    newCollectionName.trim() !== "" &&
    existingNames.includes(newCollectionName.trim().toLowerCase());
  const isTooLong = newCollectionName.trim().length > 50;

  const sortedCollections = [...collections].sort((a, b) => {
    if (a.isSystem && !b.isSystem) return -1;
    if (!a.isSystem && b.isSystem) return 1;
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isPinned && b.isPinned) {
      return (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0);
    }
    return b.createdAt - a.createdAt;
  });

  const handleToggleCollection = useCallback(
    async (collectionId: string, currentlySaved: boolean) => {
      if (!classInfo) return;

      setMutatingCollections((prev) => new Set(prev).add(collectionId));

      try {
        if (currentlySaved) {
          await removeClassFromCollection({
            collectionId,
            year: classInfo.year,
            semester: classInfo.semester,
            sessionId: classInfo.sessionId,
            subject: classInfo.subject,
            courseNumber: classInfo.courseNumber,
            classNumber: classInfo.classNumber,
          });
        } else {
          await addClassToCollection({
            collectionId,
            year: classInfo.year,
            semester: classInfo.semester,
            sessionId: classInfo.sessionId,
            subject: classInfo.subject,
            courseNumber: classInfo.courseNumber,
            classNumber: classInfo.classNumber,
          });
        }
      } catch (error) {
        console.error("Failed to toggle collection:", error);
      } finally {
        setMutatingCollections((prev) => {
          const next = new Set(prev);
          next.delete(collectionId);
          return next;
        });
      }
    },
    [classInfo, addClassToCollection, removeClassFromCollection]
  );

  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  const handleSubmitNewCollection = useCallback(async () => {
    if (!newCollectionName.trim() || hasConflict || isTooLong || !classInfo)
      return;

    const trimmedName = newCollectionName.trim();

    setIsCreatingCollection(true);

    try {
      const result = await createCollection({
        name: trimmedName,
        color: newCollectionColor as CollectionColor | null,
      });

      const collectionId = result.data?.createCollection._id;
      if (!collectionId) {
        throw new Error("Failed to get collection ID");
      }

      await addClassToCollection({
        collectionId,
        year: classInfo.year,
        semester: classInfo.semester,
        sessionId: classInfo.sessionId,
        subject: classInfo.subject,
        courseNumber: classInfo.courseNumber,
        classNumber: classInfo.classNumber,
      });

      setNewCollectionName("");
      setNewCollectionColor(null);
      setIsCreateFormOpen(false);
    } catch (error) {
      console.error("Failed to create collection:", error);
    } finally {
      setIsCreatingCollection(false);
    }
  }, [
    newCollectionName,
    newCollectionColor,
    hasConflict,
    isTooLong,
    classInfo,
    createCollection,
    addClassToCollection,
  ]);

  const resetForm = () => {
    setIsCreateFormOpen(false);
    setNewCollectionName("");
    setNewCollectionColor(null);
  };

  const isAnyClassSaved = savedCollectionIds.size > 0;
  const allSavedCollection = collections.find((c) => c.isSystem);

  const handleQuickAdd = useCallback(() => {
    if (!classInfo || !allSavedCollection) return;

    setIsPopoverOpen(true);
    setMutatingCollections((prev) => new Set(prev).add(allSavedCollection.id));

    addClassToCollection({
      collectionId: allSavedCollection.id,
      year: classInfo.year,
      semester: classInfo.semester,
      sessionId: classInfo.sessionId,
      subject: classInfo.subject,
      courseNumber: classInfo.courseNumber,
      classNumber: classInfo.classNumber,
    })
      .catch((error) => {
        console.error("Failed to quick-add to All Saved:", error);
      })
      .finally(() => {
        setMutatingCollections((prev) => {
          const next = new Set(prev);
          next.delete(allSavedCollection.id);
          return next;
        });
      });
  }, [classInfo, allSavedCollection, addClassToCollection]);

  return (
    <Popover.Root
      open={isPopoverOpen}
      onOpenChange={(open) => {
        setIsPopoverOpen(open);
        if (!open) resetForm();
      }}
    >
      <Popover.Trigger asChild>
        <IconButton
          className={classNames(styles.bookmark, {
            [styles.active]: isAnyClassSaved,
          })}
          disabled={disabled || !classInfo || collectionsLoading}
          onClick={(e) => {
            if (!isAnyClassSaved && classInfo) {
              e.preventDefault();
              handleQuickAdd();
            }
          }}
        >
          {isAnyClassSaved ? <BookmarkSolid /> : <Bookmark />}
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
                const isSaved = savedCollectionIds.has(collection.id);
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
                      disabled={mutatingCollections.has(collection.id)}
                      onClick={() =>
                        handleToggleCollection(collection.id, isSaved)
                      }
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
              transition={{
                layout: { type: "spring", stiffness: 500, damping: 35 },
              }}
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
                    layout
                  >
                    <div className={styles.createCollectionInputRow}>
                      <CollectionNameInput
                        value={newCollectionName}
                        onChange={setNewCollectionName}
                        onSubmit={handleSubmitNewCollection}
                        color={newCollectionColor}
                        onColorChange={setNewCollectionColor}
                        hasError={hasConflict || isTooLong}
                        autoFocus
                      />
                      <IconButton
                        className={styles.createCollectionSubmit}
                        disabled={
                          !newCollectionName.trim() ||
                          hasConflict ||
                          isTooLong ||
                          isCreatingCollection
                        }
                        onClick={handleSubmitNewCollection}
                      >
                        <ArrowUp width={16} height={16} />
                      </IconButton>
                    </div>
                    <AnimatePresence>
                      {(hasConflict || isTooLong) && (
                        <motion.span
                          className={styles.createCollectionError}
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{
                            opacity: { duration: 0.15 },
                            height: {
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            },
                            marginTop: {
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            },
                          }}
                        >
                          {hasConflict
                            ? "A collection with this name already exists"
                            : "Collection name must be 50 characters or less"}
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
