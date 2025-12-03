import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { WarningTriangleSolid } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button, Color, Dialog } from "@repo/theme";

import { CollectionModal } from "@/components/CollectionModal";
import {
  useCreateCollection,
  useDeleteCollection,
  useGetAllCollectionsWithPreview,
  useUpdateCollection,
} from "@/hooks/api/collections";
import { CollectionColor } from "@/lib/generated/graphql";
import { Collection, CollectionPreviewClass } from "@/types/collection";

import styles from "../Profile.module.scss";
import { AddCollectionCard, CollectionCard } from "./CollectionCard";
import deleteStyles from "./DeleteCollectionDialog.module.scss";

export default function Bookmarks() {
  const navigate = useNavigate();
  const { data: apiCollections, loading } = useGetAllCollectionsWithPreview();
  const [createCollection] = useCreateCollection();
  const [updateCollection] = useUpdateCollection();
  const [deleteCollection] = useDeleteCollection();

  const collections = useMemo<Collection[]>(() => {
    if (!apiCollections) return [];

    return apiCollections
      .map((c) => {
        const previewClasses: CollectionPreviewClass[] = [];
        for (const entry of c.classes ?? []) {
          if (previewClasses.length >= 2) break;
          if (!entry.class) continue;

          previewClasses.push({
            subject: entry.class.subject,
            courseNumber: entry.class.courseNumber,
            number: entry.class.number,
            title: entry.class.title ?? entry.class.course?.title ?? null,
            gradeAverage:
              entry.class.gradeDistribution?.average ??
              entry.class.course?.gradeDistribution?.average ??
              null,
            enrolledCount:
              entry.class.primarySection?.enrollment?.latest?.enrolledCount ??
              null,
            maxEnroll:
              entry.class.primarySection?.enrollment?.latest?.maxEnroll ?? null,
            unitsMin: entry.class.unitsMin,
            unitsMax: entry.class.unitsMax,
            hasReservedSeats:
              (entry.class.primarySection?.enrollment?.latest
                ?.activeReservedMaxCount ?? 0) > 0,
          });
        }

        return {
          id: c._id,
          name: c.name,
          classCount: c.classes?.length ?? 0,
          isPinned: !!c.pinnedAt,
          pinnedAt: c.pinnedAt ? new Date(c.pinnedAt).getTime() : null,
          isSystem: c.isSystem,
          color: (c.color ?? null) as Color | null,
          lastAdd: new Date(c.lastAdd).getTime(),
          previewClasses,
        };
      })
      .sort((a, b) => {
        if (a.isSystem && !b.isSystem) return -1;
        if (!a.isSystem && b.isSystem) return 1;
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isPinned && b.isPinned) {
          return (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0);
        }
        return b.lastAdd - a.lastAdd;
      });
  }, [apiCollections]);

  const [collectionToDelete, setCollectionToDelete] =
    useState<Collection | null>(null);
  const [collectionToRename, setCollectionToRename] =
    useState<Collection | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exitPath, setExitPath] = useState<string | null>(null);

  const initialIds = useRef<Set<string> | null>(null);
  if (initialIds.current === null && collections.length > 0) {
    initialIds.current = new Set(collections.map((c) => c.id));
  }

  useEffect(() => {
    if (initialIds.current) {
      collections.forEach((c) => initialIds.current!.add(c.id));
    }
  }, [collections]);

  const handleCollectionClick = useCallback((path: string) => {
    setExitPath(path);
    setIsExiting(true);
  }, []);

  const handleExitComplete = useCallback(() => {
    if (isExiting && exitPath) {
      navigate(exitPath);
    }
  }, [isExiting, exitPath, navigate]);

  const handleCreateCollection = useCallback(
    async (name: string, color: string | null) => {
      try {
        await createCollection({
          name,
          color: color as CollectionColor | null,
        });
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Failed to create collection:", error);
      }
    },
    [createCollection]
  );

  const handlePin = useCallback(
    async (collectionId: string, isPinned: boolean) => {
      try {
        await updateCollection(collectionId, { pinned: isPinned });
      } catch (error) {
        console.error("Failed to pin collection:", error);
      }
    },
    [updateCollection]
  );

  const handleDeleteClick = (collection: Collection) => {
    setCollectionToDelete(collection);
    setIsDeleteModalOpen(true);
  };

  const handleRenameClick = (collection: Collection) => {
    setCollectionToRename(collection);
    setIsRenameModalOpen(true);
  };

  const handleCloseRenameModal = () => {
    setIsRenameModalOpen(false);
    setCollectionToRename(null);
  };

  const handleRenameCollection = useCallback(
    async (newName: string, color: string | null) => {
      if (!collectionToRename) return;

      try {
        await updateCollection(collectionToRename.id, {
          name: newName,
          color: color as CollectionColor | null,
        });
        handleCloseRenameModal();
      } catch (error) {
        console.error("Failed to rename collection:", error);
      }
    },
    [collectionToRename, updateCollection]
  );

  const handleColorChange = useCallback(
    async (collectionId: string, color: string | null) => {
      try {
        await updateCollection(collectionId, {
          color: color as CollectionColor | null,
        });
      } catch (error) {
        console.error("Failed to change collection color:", error);
      }
    },
    [updateCollection]
  );

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCollectionToDelete(null);
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!collectionToDelete) return;

    try {
      await deleteCollection(collectionToDelete.id);
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Failed to delete collection:", error);
    }
  }, [collectionToDelete, deleteCollection]);

  if (loading) {
    return (
      <div className={styles.contentInner}>
        <h1 className={styles.pageTitle}>Bookmarks</h1>
        <div className={styles.pageContent}>
          <p>Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.contentInner}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      onAnimationComplete={handleExitComplete}
    >
      <h1 className={styles.pageTitle}>Bookmarks</h1>
      <div className={styles.pageContent}>
        <div className={styles.collectionsSection}>
          <div className={styles.collectionsHeader}>
            <h2 className={styles.sectionTitle}>Collections</h2>
            <button
              className={styles.newCollectionButton}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Collection
            </button>
          </div>
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  layout
                  initial={
                    initialIds.current?.has(collection.id)
                      ? false
                      : { opacity: 0, scale: 0.8 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <CollectionCard
                    name={collection.name}
                    classCount={collection.classCount}
                    isPinned={collection.isPinned}
                    isSystem={collection.isSystem}
                    color={collection.color}
                    previewClasses={collection.previewClasses}
                    onPin={(isPinned) => handlePin(collection.id, isPinned)}
                    onRename={() => handleRenameClick(collection)}
                    onColorChange={(color) =>
                      handleColorChange(collection.id, color)
                    }
                    onDelete={() => handleDeleteClick(collection)}
                    onClick={() => {
                      const firstClass = collection.previewClasses?.[0];
                      if (firstClass) {
                        handleCollectionClick(
                          `/collection/${collection.id}/${firstClass.subject.toLowerCase()}/${firstClass.courseNumber.toLowerCase()}/${firstClass.number}`
                        );
                      } else {
                        handleCollectionClick(`/collection/${collection.id}`);
                      }
                    }}
                  />
                </motion.div>
              ))}
              <motion.div key="add-collection" layout>
                <AddCollectionCard onClick={() => setIsCreateModalOpen(true)} />
              </motion.div>
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>

      <Dialog.Root
        open={isDeleteModalOpen}
        onOpenChange={handleCloseDeleteModal}
      >
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Card>
            <VisuallyHidden>
              <Dialog.Title>Delete Collection</Dialog.Title>
              <Dialog.Description>
                Confirm deletion of collection
              </Dialog.Description>
            </VisuallyHidden>
            <Dialog.Body className={deleteStyles.body}>
              <WarningTriangleSolid className={deleteStyles.icon} />
              <div className={deleteStyles.title}>Delete Collection</div>
              <div className={deleteStyles.message}>
                This collection will be permanently deleted.
                <br />
                This action cannot be undone.
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                onClick={handleCloseDeleteModal}
                variant="tertiary"
                style={{ color: "var(--paragraph-color)" }}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} isDelete>
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Card>
        </Dialog.Portal>
      </Dialog.Root>

      <CollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCollection}
        existingNames={collections.map((c) => c.name)}
      />

      <CollectionModal
        isOpen={isRenameModalOpen}
        onClose={handleCloseRenameModal}
        onSubmit={handleRenameCollection}
        existingNames={collections
          .filter((c) => c.id !== collectionToRename?.id)
          .map((c) => c.name)}
        mode="rename"
        initialName={collectionToRename?.name}
        initialColor={collectionToRename?.color}
      />
    </motion.div>
  );
}
