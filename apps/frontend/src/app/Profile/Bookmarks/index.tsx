import { useCallback, useRef, useState } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { WarningTriangleSolid } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button, Dialog, Grid } from "@repo/theme";

import { CollectionModal } from "@/components/CollectionModal";
import { ALL_SAVED_COLLECTION_NAME, Collection } from "@/types/collection";

import styles from "../Profile.module.scss";
import { AddCollectionCard, CollectionCard } from "./CollectionCard";
import deleteStyles from "./DeleteCollectionDialog.module.scss";

const initialCollections: Collection[] = [
  { id: "1", name: ALL_SAVED_COLLECTION_NAME, classCount: 24, isPinned: false, color: null, createdAt: 0 },
  { id: "2", name: "Fall 2025", classCount: 8, isPinned: false, color: null, createdAt: 1 },
  { id: "3", name: "Spring 2026", classCount: 12, isPinned: false, color: null, createdAt: 2 },
  { id: "4", name: "Breadths", classCount: 5, isPinned: false, color: null, createdAt: 3 },
  { id: "5", name: "Major Requirements", classCount: 15, isPinned: false, color: null, createdAt: 4 },
];

export default function Bookmarks() {
  const navigate = useNavigate();
  const [collections, setCollections] =
    useState<Collection[]>(initialCollections);
  const [collectionToDelete, setCollectionToDelete] =
    useState<Collection | null>(null);
  const [collectionToRename, setCollectionToRename] =
    useState<Collection | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exitPath, setExitPath] = useState<string | null>(null);

  // Track initial collection IDs to skip entrance animation on page load
  const initialIds = useRef(new Set(initialCollections.map((c) => c.id)));

  const handleCollectionClick = useCallback((path: string) => {
    setExitPath(path);
    setIsExiting(true);
  }, []);

  const handleExitComplete = useCallback(() => {
    if (isExiting && exitPath) {
      navigate(exitPath);
    }
  }, [isExiting, exitPath, navigate]);

  const handleCreateCollection = (name: string, color: string | null) => {
    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      classCount: 0,
      isPinned: false,
      color,
      createdAt: Date.now(),
    };
    setCollections((prev) => [...prev, newCollection]);
  };

  const handlePin = (id: string, isPinned: boolean) => {
    setCollections((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, isPinned } : c));
      // Sort: pinned items first, then maintain original order
      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
    });
  };

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

  const handleRenameCollection = (newName: string, color: string | null) => {
    if (collectionToRename) {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionToRename.id ? { ...c, name: newName, color } : c
        )
      );
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCollectionToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (collectionToDelete) {
      setCollections((prev) =>
        prev.filter((c) => c.id !== collectionToDelete.id)
      );
    }
    handleCloseDeleteModal();
  };

  return (
    <motion.div
      className={styles.contentInner}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      onAnimationComplete={handleExitComplete}
    >
      <h1 className={styles.pageTitle}>Bookmarks</h1>
      <div className={styles.pageContent}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Collections</h2>
            <button
              className={styles.newCollectionButton}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Collection
            </button>
          </div>
          <Grid gap="20px" columns="repeat(auto-fit, 420px)">
            <LayoutGroup>
              <AnimatePresence mode="popLayout">
                {collections.map((collection) => (
                  <motion.div
                    key={collection.id}
                    layout
                    initial={
                      initialIds.current.has(collection.id)
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
                      color={collection.color}
                      onPin={(isPinned) => handlePin(collection.id, isPinned)}
                      onRename={() => handleRenameClick(collection)}
                      onDelete={() => handleDeleteClick(collection)}
                      onClick={() => handleCollectionClick("/collection/demo")}
                    />
                  </motion.div>
                ))}
                <motion.div key="add-collection" layout>
                  <AddCollectionCard
                    onClick={() => setIsCreateModalOpen(true)}
                  />
                </motion.div>
              </AnimatePresence>
            </LayoutGroup>
          </Grid>
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
