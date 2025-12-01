import { useState } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { LayoutGroup, motion } from "framer-motion";
import { WarningTriangleSolid } from "iconoir-react";

import { Button, Dialog, Grid } from "@repo/theme";

import styles from "../Profile.module.scss";
import { CollectionCard } from "./CollectionCard";
import deleteStyles from "./DeleteCollectionDialog.module.scss";

interface Collection {
  id: string;
  name: string;
  classCount: number;
  isPinned: boolean;
}

const initialCollections: Collection[] = [
  { id: "1", name: "All saved", classCount: 24, isPinned: false },
  { id: "2", name: "Fall 2025", classCount: 8, isPinned: false },
  { id: "3", name: "Spring 2026", classCount: 12, isPinned: false },
  { id: "4", name: "Breadths", classCount: 5, isPinned: false },
  { id: "5", name: "Major Requirements", classCount: 15, isPinned: false },
];

export default function Bookmarks() {
  const [collections, setCollections] =
    useState<Collection[]>(initialCollections);
  const [collectionToDelete, setCollectionToDelete] =
    useState<Collection | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCollectionToDelete(null);
  };

  const handleConfirmDelete = async () => {
    // No-op for now - backend not implemented yet
    handleCloseDeleteModal();
  };

  return (
    <div className={styles.contentInner}>
      <h1 className={styles.pageTitle}>Bookmarks</h1>
      <div className={styles.pageContent}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Collections</h2>
          <Grid gap="20px" columns="repeat(auto-fit, 420px)">
            <LayoutGroup>
              {collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <CollectionCard
                    name={collection.name}
                    classCount={collection.classCount}
                    isPinned={collection.isPinned}
                    onPin={(isPinned) => handlePin(collection.id, isPinned)}
                    onDelete={() => handleDeleteClick(collection)}
                  />
                </motion.div>
              ))}
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
                No, keep it
              </Button>
              <Button onClick={handleConfirmDelete} isDelete>
                Yes, delete
              </Button>
            </Dialog.Footer>
          </Dialog.Card>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
