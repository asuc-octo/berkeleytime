import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Book, Folder, NavArrowRight } from "iconoir-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Color, DropdownMenu, Flex, Tooltip } from "@repo/theme";

import Class from "@/components/Class";
import ClassBrowser from "@/components/ClassBrowser";
import { useReadTerms } from "@/hooks/api";
import { useGetClass } from "@/hooks/api/classes/useGetClass";
import {
  useGetAllCollections,
  useGetCollectionById,
} from "@/hooks/api/collections";
import useUser from "@/hooks/useUser";
import { getColorCSSVar } from "@/lib/colors";
import { Semester } from "@/lib/generated/graphql";
import { RecentType, addRecent, getRecents } from "@/lib/recent";
import { compareCollectionsByBookmarksOrder } from "@/utils/collections";

import styles from "./Catalog.module.scss";
import useCatalogLayoutMode from "./hooks/useCatalogLayoutMode";

// Semester hierarchy for chronological ordering (latest to earliest in year)
const SEMESTER_ORDER: Record<Semester, number> = {
  [Semester.Spring]: 0,
  [Semester.Summer]: 1,
  [Semester.Fall]: 2,
  [Semester.Winter]: 3,
};

type SavedClassItem = {
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  number: string;
  sessionId: string;
};

type CatalogAvailabilityClass = {
  subject: string;
  courseNumber: string;
  number: string;
  sessionId: string;
};

type CollectionSummaryItem = {
  id: string;
  name: string;
  classCount: number;
  color: Color | null;
  isSystem: boolean;
  isPinned: boolean;
  pinnedAt: number | null;
  lastAdd: number;
};

function SavedCollectionSection({
  collection,
  index,
  onSelect,
  resolveCurrentTermClass,
}: {
  collection: CollectionSummaryItem;
  index: number;
  onSelect: (savedClass: SavedClassItem) => void;
  resolveCurrentTermClass: (
    savedClass: SavedClassItem
  ) => SavedClassItem | null;
}) {
  const [open, setOpen] = useState(false);
  const { data: collectionData, loading } = useGetCollectionById(
    collection.id,
    {
      skip: !open,
    }
  );

  const savedClasses = useMemo<SavedClassItem[]>(() => {
    if (!collectionData?.classes) return [];

    return collectionData.classes
      .map((entry): SavedClassItem | null => {
        const savedClass = entry.class;
        if (
          !savedClass ||
          typeof savedClass.year !== "number" ||
          !savedClass.semester ||
          !savedClass.sessionId ||
          !savedClass.subject ||
          !savedClass.courseNumber ||
          !savedClass.number
        ) {
          return null;
        }

        return {
          year: savedClass.year,
          semester: savedClass.semester as Semester,
          subject: savedClass.subject,
          courseNumber: savedClass.courseNumber,
          number: savedClass.number,
          sessionId: savedClass.sessionId,
        };
      })
      .filter((savedClass): savedClass is SavedClassItem => savedClass !== null)
      .sort((a, b) => {
        return (
          b.year - a.year ||
          SEMESTER_ORDER[b.semester] - SEMESTER_ORDER[a.semester] ||
          a.subject.localeCompare(b.subject) ||
          a.courseNumber.localeCompare(b.courseNumber, undefined, {
            numeric: true,
          }) ||
          a.number.localeCompare(b.number, undefined, { numeric: true })
        );
      });
  }, [collectionData]);

  const savedClassEntries = useMemo(
    () =>
      savedClasses.map((savedClass) => {
        const currentTermClass = resolveCurrentTermClass(savedClass);
        return {
          savedClass,
          currentTermClass,
          isUnavailable: !currentTermClass,
        };
      }),
    [savedClasses, resolveCurrentTermClass]
  );

  const sortedSavedClassEntries = useMemo(() => {
    const available = savedClassEntries.filter((entry) => !entry.isUnavailable);
    const unavailable = savedClassEntries.filter(
      (entry) => entry.isUnavailable
    );
    return [...available, ...unavailable];
  }, [savedClassEntries]);

  const folderColor = getColorCSSVar(collection.color);
  const folderIconStyle = folderColor
    ? ({ "--bookmark-folder-color": folderColor } as CSSProperties)
    : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{
        layout: { type: "spring", stiffness: 420, damping: 34 },
        opacity: { duration: 0.2, delay: index * 0.02 },
        y: { type: "spring", stiffness: 420, damping: 34, delay: index * 0.02 },
        scale: {
          type: "spring",
          stiffness: 420,
          damping: 34,
          delay: index * 0.02,
        },
      }}
    >
      <DropdownMenu.Root modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button type="button" className={styles.bookmarkButton}>
            <Folder
              width={16}
              height={16}
              className={folderColor ? styles.bookmarkFolderIcon : undefined}
              style={folderIconStyle}
            />
            <span className={styles.bookmarkButtonText}>{collection.name}</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          align="start"
          side="bottom"
          sideOffset={6}
          className={styles.bookmarkDropdown}
        >
          {loading ? (
            <DropdownMenu.Item disabled>Loading classes...</DropdownMenu.Item>
          ) : sortedSavedClassEntries.length > 0 ? (
            sortedSavedClassEntries.map(
              ({ savedClass, currentTermClass, isUnavailable }) => {
                return (
                  <DropdownMenu.Item
                    key={`${collection.id}-${savedClass.year}-${savedClass.semester}-${savedClass.subject}-${savedClass.courseNumber}-${savedClass.number}-${savedClass.sessionId}`}
                    disabled={isUnavailable}
                    className={
                      isUnavailable ? styles.bookmarkUnavailableItem : undefined
                    }
                    onSelect={() => {
                      if (!currentTermClass) return;
                      onSelect(currentTermClass);
                    }}
                    title={`${savedClass.subject} ${savedClass.courseNumber}`}
                  >
                    <span className={styles.bookmarkClassOption}>
                      <span>
                        {savedClass.subject} {savedClass.courseNumber}
                      </span>
                      {isUnavailable && (
                        <span className={styles.bookmarkUnavailableHint}>
                          Unavailable for term
                        </span>
                      )}
                    </span>
                  </DropdownMenu.Item>
                );
              }
            )
          ) : (
            <DropdownMenu.Item disabled>
              No classes in this collection.
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </motion.div>
  );
}

export default function Catalog() {
  const {
    year: providedYear,
    semester: providedSemester,
    subject: providedSubject,
    courseNumber,
    number,
    sessionId,
  } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const mode = useCatalogLayoutMode();
  const isDesktop = mode !== "compact";
  const hasClassSelected = Boolean(providedSubject && courseNumber && number);

  const [catalogDrawerOpen, setCatalogDrawerOpen] = useState(
    () => !isDesktop && !hasClassSelected
  );

  const { data: terms } = useReadTerms();
  const { data: collections, loading: collectionsLoading } =
    useGetAllCollections({
      skip: !user,
    });
  const [catalogAvailabilityClasses, setCatalogAvailabilityClasses] = useState<
    CatalogAvailabilityClass[]
  >([]);
  const handleCatalogClassAvailabilityChange = useCallback(
    (classes: CatalogAvailabilityClass[]) => {
      setCatalogAvailabilityClasses(classes);
    },
    []
  );

  const semester = useMemo(() => {
    if (!providedSemester) return null;

    return providedSemester[0].toUpperCase() + providedSemester.slice(1);
  }, [providedSemester]);

  const year = useMemo(() => {
    if (!providedYear) return null;

    return parseInt(providedYear) || null;
  }, [providedYear]);

  const term = useMemo(() => {
    if (!terms) return null;

    const recentTerm = getRecents(RecentType.CatalogTerm)[0];

    // Default to the latest term by year + semester hierarchy
    const latestTerm = terms.toSorted((a, b) => {
      // Sort by year DESC first
      if (a.year !== b.year) return b.year - a.year;
      // Then by semester hierarchy DESC
      return SEMESTER_ORDER[b.semester] - SEMESTER_ORDER[a.semester];
    })[0];

    const selectedTerm =
      terms?.find((term) => term.year === year && term.semester === semester) ??
      terms.find(
        (term) =>
          term.year === recentTerm?.year &&
          term.semester === recentTerm?.semester
      ) ??
      latestTerm;

    if (selectedTerm) {
      addRecent(RecentType.CatalogTerm, {
        year: selectedTerm.year,
        semester: selectedTerm.semester,
      });
    }

    return selectedTerm ?? null;
  }, [terms, year, semester]);

  // Fallback term so the catalog UI always renders (query will return 0 results)
  const [fallbackTerm] = useState(() => ({
    year: new Date().getFullYear(),
    semester: Semester.Spring as Semester,
  }));
  const effectiveTerm = term ?? fallbackTerm;

  useEffect(() => {
    setCatalogAvailabilityClasses([]);
  }, [effectiveTerm.year, effectiveTerm.semester]);

  const subject = useMemo(
    () => providedSubject?.toUpperCase(),
    [providedSubject]
  );

  // Auto-expand drawer on mobile when no class is selected
  useEffect(() => {
    if (!isDesktop && !hasClassSelected) {
      setCatalogDrawerOpen(true);
    }
  }, [isDesktop, hasClassSelected]);

  const { data: _class, error: classError } = useGetClass(
    effectiveTerm.year,
    effectiveTerm.semester as Semester,
    sessionId as string,
    subject as string,
    courseNumber as string,
    number as string,
    {
      skip: !subject || !courseNumber || !number || !sessionId || !term,
    }
  );

  // Keep reference to last valid class to prevent blank frames during transitions
  const lastClassRef = useRef(_class);
  if (_class) {
    lastClassRef.current = _class;
  }
  const displayedClass = _class ?? lastClassRef.current;

  const orderedNonEmptyCollections = useMemo<CollectionSummaryItem[]>(() => {
    if (!collections) return [];

    return collections
      .filter((collection) => {
        return Boolean(collection._id && collection.name);
      })
      .map((collection) => ({
        id: collection._id,
        name: collection.name,
        classCount: collection.classes?.length ?? 0,
        color: (collection.color ?? null) as Color | null,
        isSystem: collection.isSystem,
        isPinned: !!collection.pinnedAt,
        pinnedAt: collection.pinnedAt
          ? new Date(collection.pinnedAt).getTime()
          : null,
        lastAdd: new Date(collection.lastAdd).getTime(),
      }))
      .filter((collection) => collection.classCount > 0)
      .sort(compareCollectionsByBookmarksOrder);
  }, [collections]);
  const cappedOrderedCollections = useMemo(
    () => orderedNonEmptyCollections.slice(0, 5),
    [orderedNonEmptyCollections]
  );
  const foldersViewportRef = useRef<HTMLDivElement | null>(null);
  const measureButtonRefs = useRef<Record<string, HTMLButtonElement | null>>(
    {}
  );
  const [visibleCollectionIds, setVisibleCollectionIds] = useState<string[]>(
    []
  );

  const recomputeVisibleCollections = useCallback(() => {
    const viewportWidth = foldersViewportRef.current?.clientWidth ?? 0;
    if (viewportWidth <= 0) {
      setVisibleCollectionIds([]);
      return;
    }

    const gapPx = 8;
    let usedWidth = 0;
    const nextVisibleIds: string[] = [];

    for (const collection of cappedOrderedCollections) {
      const buttonEl = measureButtonRefs.current[collection.id];
      const buttonWidth = buttonEl?.offsetWidth ?? 0;
      if (buttonWidth <= 0) continue;

      const requiredWidth = nextVisibleIds.length
        ? buttonWidth + gapPx
        : buttonWidth;
      if (usedWidth + requiredWidth > viewportWidth + 0.5) break;

      nextVisibleIds.push(collection.id);
      usedWidth += requiredWidth;
    }

    setVisibleCollectionIds(nextVisibleIds);
  }, [cappedOrderedCollections]);

  useEffect(() => {
    recomputeVisibleCollections();
  }, [recomputeVisibleCollections]);

  useEffect(() => {
    const viewportEl = foldersViewportRef.current;
    if (!viewportEl) return;

    const resizeObserver = new ResizeObserver(() => {
      recomputeVisibleCollections();
    });
    resizeObserver.observe(viewportEl);
    Object.values(measureButtonRefs.current).forEach((buttonEl) => {
      if (buttonEl) resizeObserver.observe(buttonEl);
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [cappedOrderedCollections, recomputeVisibleCollections]);

  const visibleCollections = useMemo(() => {
    const visibleIds = new Set(visibleCollectionIds);
    return cappedOrderedCollections.filter((collection) =>
      visibleIds.has(collection.id)
    );
  }, [cappedOrderedCollections, visibleCollectionIds]);

  const catalogAvailabilityByCourse = useMemo(() => {
    const map = new Map<string, CatalogAvailabilityClass[]>();

    catalogAvailabilityClasses.forEach((_class) => {
      const key = `${_class.subject.toUpperCase()}|${_class.courseNumber.toUpperCase()}`;
      const existing = map.get(key);
      if (existing) {
        existing.push(_class);
      } else {
        map.set(key, [_class]);
      }
    });

    return map;
  }, [catalogAvailabilityClasses]);

  const resolveCurrentTermClass = useCallback(
    (savedClass: SavedClassItem): SavedClassItem | null => {
      if (!term) return null;

      const key = `${savedClass.subject.toUpperCase()}|${savedClass.courseNumber.toUpperCase()}`;
      const candidates = catalogAvailabilityByCourse.get(key);
      if (!candidates?.length) return null;

      const exactNumberMatch =
        candidates.find(
          (candidate) => candidate.number === savedClass.number
        ) ?? null;
      const matchedClass = exactNumberMatch ?? candidates[0];

      return {
        year: effectiveTerm.year,
        semester: effectiveTerm.semester,
        subject: matchedClass.subject,
        courseNumber: matchedClass.courseNumber,
        number: matchedClass.number,
        sessionId: matchedClass.sessionId,
      };
    },
    [catalogAvailabilityByCourse, effectiveTerm, term]
  );

  const handleSelect = useCallback(
    (
      subject: string,
      courseNumber: string,
      number: string,
      sessionId: string
    ) => {
      if (!term) return;

      setCatalogDrawerOpen(false); // Close drawer when selecting a class

      navigate({
        ...location,
        pathname: `/catalog/${effectiveTerm.year}/${effectiveTerm.semester}/${subject}/${courseNumber}/${number}/${sessionId}`,
      });
    },
    [location, navigate, effectiveTerm, term]
  );

  const handleSavedClassSelect = useCallback(
    (savedClass: SavedClassItem) => {
      navigate({
        ...location,
        pathname: `/catalog/${savedClass.year}/${savedClass.semester}/${savedClass.subject}/${savedClass.courseNumber}/${savedClass.number}/${savedClass.sessionId}`,
      });
    },
    [location, navigate]
  );
  const handleGoToCollectionsPage = useCallback(() => {
    navigate("/profile/bookmarks");
  }, [navigate]);

  // TODO: Error state for terms loading failure

  return (
    <>
      <div className={styles.root}>
        {isDesktop ? (
          // Desktop: Static panel
          <div className={styles.panel}>
            <ClassBrowser
              onSelect={handleSelect}
              onCatalogClassAvailabilityChange={
                handleCatalogClassAvailabilityChange
              }
              forceMode={mode}
              semester={effectiveTerm.semester}
              year={effectiveTerm.year}
              terms={terms ?? undefined}
              persistent
            />
          </div>
        ) : (
          // Mobile: Drawer overlay
          <>
            <AnimatePresence>
              {catalogDrawerOpen && (
                <motion.div
                  className={styles.overlay}
                  onClick={() => setCatalogDrawerOpen(false)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>
            <motion.div
              className={styles.catalogDrawer}
              animate={{ x: catalogDrawerOpen ? 0 : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <ClassBrowser
                onSelect={handleSelect}
                onCatalogClassAvailabilityChange={
                  handleCatalogClassAvailabilityChange
                }
                forceMode={mode}
                semester={effectiveTerm.semester}
                year={effectiveTerm.year}
                terms={terms ?? undefined}
                persistent
              />
            </motion.div>
          </>
        )}

        {!isDesktop && (
          <div
            className={styles.drawerTrigger}
            onClick={() => setCatalogDrawerOpen(true)}
          >
            {!catalogDrawerOpen && <NavArrowRight />}
          </div>
        )}

        <Flex direction="column" flexGrow="1" className={styles.view}>
          {user && (
            <div className={styles.bookmarkBanner}>
              <div
                className={styles.bookmarkFoldersViewport}
                ref={foldersViewportRef}
              >
                {collectionsLoading ? (
                  <span className={styles.bookmarkEmptyState}>
                    Loading collections...
                  </span>
                ) : cappedOrderedCollections.length > 0 ? (
                  <>
                    <div className={styles.bookmarkFolders}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        {visibleCollections.map((collection, index) => (
                          <SavedCollectionSection
                            key={collection.id}
                            collection={collection}
                            index={index}
                            onSelect={handleSavedClassSelect}
                            resolveCurrentTermClass={resolveCurrentTermClass}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                    <div
                      className={styles.bookmarkMeasureRow}
                      aria-hidden="true"
                    >
                      {cappedOrderedCollections.map((collection) => {
                        const folderColor = getColorCSSVar(collection.color);
                        const folderIconStyle = folderColor
                          ? ({
                              "--bookmark-folder-color": folderColor,
                            } as CSSProperties)
                          : undefined;

                        return (
                          <button
                            key={`measure-${collection.id}`}
                            type="button"
                            className={styles.bookmarkButton}
                            tabIndex={-1}
                            ref={(el) => {
                              measureButtonRefs.current[collection.id] = el;
                            }}
                          >
                            <Folder
                              width={16}
                              height={16}
                              className={
                                folderColor
                                  ? styles.bookmarkFolderIcon
                                  : undefined
                              }
                              style={folderIconStyle}
                            />
                            <span className={styles.bookmarkButtonText}>
                              {collection.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <span className={styles.bookmarkEmptyState}>
                    No saved classes yet.
                  </span>
                )}
              </div>
              <Tooltip
                title="Collections page"
                side="bottom"
                trigger={
                  <button
                    type="button"
                    className={styles.bookmarkCollectionsButton}
                    onClick={handleGoToCollectionsPage}
                    aria-label="Go to collections page"
                  >
                    <Book width={16} height={16} />
                  </button>
                }
              />
            </div>
          )}
          {displayedClass && !classError && (
            <div className={styles.classContainer}>
              <Class class={displayedClass} scrollWithinContent />
            </div>
          )}
        </Flex>
      </div>
    </>
  );
}
