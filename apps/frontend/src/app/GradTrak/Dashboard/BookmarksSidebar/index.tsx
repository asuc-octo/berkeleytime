import { useMemo, useState } from "react";

import { Bookmark, NavArrowRight } from "iconoir-react";

import { Button, Color } from "@repo/theme";

import { CollectionCard } from "@/app/Profile/Bookmarks/CollectionCard";
import ClassCard from "@/components/ClassCard";
import { useGetAllCollectionsWithPreview } from "@/hooks/api/collections";
import { Collection, CollectionPreviewClass } from "@/types/collection";

import styles from "./BookmarksSidebar.module.scss";

interface BookmarksSidebarProps {
  onClose: () => void;
}

const GRADTRAK_BOOKMARK_DRAG_TYPE = "application/x-gradtrak-bookmark-class";

export default function BookmarksSidebar({ onClose }: BookmarksSidebarProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);

  const { data: apiCollections, loading } = useGetAllCollectionsWithPreview();

  const collections = useMemo<Collection[]>(() => {
    if (!apiCollections) return [];
    return apiCollections
      .map((c) => {
        const previewClasses: CollectionPreviewClass[] = [];
        for (const entry of c.classes ?? []) {
          if (previewClasses.length >= 2) break;
          if (!entry.class) continue;
          const cls = entry.class;
          previewClasses.push({
            subject: cls.subject,
            courseNumber: cls.courseNumber,
            number: cls.number,
            title: cls.title ?? cls.course?.title ?? null,
            gradeAverage:
              cls.gradeDistribution?.average ??
              cls.course?.gradeDistribution?.average ??
              null,
            enrolledCount:
              cls.primarySection?.enrollment?.latest?.enrolledCount ?? null,
            maxEnroll:
              cls.primarySection?.enrollment?.latest?.maxEnroll ?? null,
            unitsMin: cls.unitsMin ?? 0,
            unitsMax: cls.unitsMax ?? 0,
            hasReservedSeats:
              (cls.primarySection?.enrollment?.latest
                ?.activeReservedMaxCount ?? 0) > 0,
          });
        }
        return {
          id: c._id,
          name: c.name,
          classCount: c.classes?.length ?? 0,
          isPinned: !!c.pinnedAt,
          pinnedAt: c.pinnedAt ? new Date(c.pinnedAt).getTime() : null,
          isSystem: c.isSystem ?? false,
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
        if (a.isPinned && b.isPinned && a.pinnedAt != null && b.pinnedAt != null) {
          return b.pinnedAt - a.pinnedAt;
        }
        return b.lastAdd - a.lastAdd;
      });
  }, [apiCollections]);

  const selectedCollection = useMemo(
    () => collections.find((c) => c.id === selectedCollectionId) ?? null,
    [collections, selectedCollectionId]
  );

  const selectedCollectionApi = useMemo(
    () =>
      apiCollections?.find((c) => c._id === selectedCollectionId) ?? null,
    [apiCollections, selectedCollectionId]
  );

  const handleBack = () => {
    setSelectedCollectionId(null);
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.topRow}>
          <button
            type="button"
            className={styles.closeSidebarButton}
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <NavArrowRight className={styles.closeSidebarIcon} />
          </button>
          <Button
            variant="secondary"
            onClick={onClose}
            className={styles.bookmarksButton}
          >
            <Bookmark />
            Bookmarks
          </Button>
        </div>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
          {selectedCollection ? (
            <>
              <Button
                variant="secondary"
                onClick={handleBack}
                className={styles.backButton}
              >
                Back
              </Button>
              <h2
                className={`${styles.headerTitle} ${styles.headerTitleRight}`}
              >
                {selectedCollection.name}
              </h2>
            </>
          ) : (
            <h2 className={styles.headerTitle}>Bookmarks</h2>
          )}
        </div>
        {!selectedCollection && (
          <Button
            variant="secondary"
            onClick={onClose}
            className={styles.closeButton}
          >
            Close
          </Button>
        )}
        </div>
      </div>

      <div className={styles.content}>
        {selectedCollection && selectedCollectionApi ? (
          <>
            {selectedCollectionApi.classes?.length === 0 ? (
              <div className={styles.classEmpty}>
                No classes in this collection
              </div>
            ) : (
              <div className={styles.classList}>
                {selectedCollectionApi.classes?.map((entry) => {
                  const c = entry?.class;
                  if (!c) return null;
                  return (
                    <div
                      key={`${c.subject}-${c.courseNumber}-${c.number}`}
                      className={styles.draggableClassWrapper}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          GRADTRAK_BOOKMARK_DRAG_TYPE,
                          JSON.stringify({
                            source: "bookmarks",
                            class: {
                              subject: c.subject,
                              courseNumber: c.courseNumber,
                              number: c.number,
                              title: c.title ?? c.course?.title ?? "",
                              unitsMin: c.unitsMin ?? 0,
                              unitsMax: c.unitsMax ?? 0,
                            },
                          })
                        );
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                    >
                      <ClassCard
                        class={c}
                        style={{ cursor: "grab" }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : collections.length === 0 ? (
              <div className={styles.empty}>No collections yet.</div>
            ) : (
              <div className={styles.collectionCards}>
                {collections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    name={collection.name}
                    classCount={collection.classCount}
                    isPinned={collection.isPinned}
                    isSystem={collection.isSystem}
                    color={collection.color}
                    previewClasses={collection.previewClasses}
                    onClick={() => setSelectedCollectionId(collection.id)}
                    width={346}
                    height={204}
                    showPin={!collection.isSystem}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
