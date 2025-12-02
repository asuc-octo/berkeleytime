import { useCallback, useEffect, useMemo, useState } from "react";

import classNames from "classnames";
import { motion } from "framer-motion";
import { ArrowLeft, NavArrowRight, Xmark } from "iconoir-react";
import { useNavigate, useParams } from "react-router-dom";

import { Boundary, Flex, LoadingIndicator } from "@repo/theme";

import Class from "@/components/Class";
import ClassCard from "@/components/ClassCard";
import { useGetClass } from "@/hooks/api/classes/useGetClass";
import { useGetCollectionById } from "@/hooks/api/collections";
import { Semester } from "@/lib/generated/graphql";

import styles from "./CollectionDetail.module.scss";

export default function CollectionDetail() {
  const navigate = useNavigate();
  const { id, subject, courseNumber, number } = useParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const {
    data: collection,
    loading: collectionLoading,
    error: collectionError,
  } = useGetCollectionById(id ?? "");

  // Filter out classes that couldn't be found in the catalog
  const classes = useMemo(
    () =>
      collection?.classes
        ?.filter((c) => c.class !== null)
        .map((c) => c.class!) ?? [],
    [collection]
  );

  const selectedClassInfo = useMemo(() => {
    if (!subject || !courseNumber || !number) return null;
    return classes.find(
      (c) =>
        c.subject.toLowerCase() === subject.toLowerCase() &&
        c.courseNumber.toLowerCase() === courseNumber.toLowerCase() &&
        c.number === number
    );
  }, [classes, subject, courseNumber, number]);

  const { data: classData, loading: classLoading } = useGetClass(
    selectedClassInfo?.year ?? 0,
    (selectedClassInfo?.semester as Semester) ?? Semester.Fall,
    selectedClassInfo?.subject ?? "",
    selectedClassInfo?.courseNumber ?? "",
    selectedClassInfo?.number ?? "",
    {
      skip: !selectedClassInfo,
    }
  );

  const handleBack = useCallback(() => {
    setIsExiting(true);
  }, []);

  const handleExitComplete = useCallback(() => {
    if (isExiting) {
      navigate("/profile/bookmarks");
    }
  }, [isExiting, navigate]);

  const handleClassSelect = useCallback(
    (classItem: (typeof classes)[0]) => {
      navigate(
        `/collection/${id}/${classItem.subject.toLowerCase()}/${classItem.courseNumber.toLowerCase()}/${classItem.number}`
      );
      setDrawerOpen(false);
    },
    [navigate, id]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 992) {
        setShowFloatingButton(false);
        return;
      }
      setShowFloatingButton(e.clientX < 60);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isClassActive = (classItem: (typeof classes)[0]) => {
    if (!subject || !courseNumber || !number) return false;
    return (
      classItem.subject.toLowerCase() === subject.toLowerCase() &&
      classItem.courseNumber.toLowerCase() === courseNumber.toLowerCase() &&
      classItem.number === number
    );
  };

  const classListContent = classes.map((classItem) => (
    <ClassCard
      key={`${classItem.subject}-${classItem.courseNumber}-${classItem.number}-${classItem.year}-${classItem.semester}`}
      class={classItem}
      active={isClassActive(classItem)}
      onClick={() => handleClassSelect(classItem)}
      style={{ cursor: "pointer" }}
    />
  ));

  if (collectionLoading) {
    return (
      <Boundary>
        <LoadingIndicator size="lg" />
      </Boundary>
    );
  }

  if (collectionError || !collection) {
    return (
      <div className={styles.root}>
        <Boundary className={styles.emptyState}>
          <h3>Collection not found</h3>
          <p>This collection may have been deleted or doesn't exist.</p>
        </Boundary>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.root}
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      onAnimationComplete={handleExitComplete}
    >
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            <ArrowLeft width={12} height={12} />
            Back
          </button>
          <h2 className={styles.title}>{collection.name}</h2>
        </div>
        <div className={styles.listContainer}>
          <div className={styles.classList}>{classListContent}</div>
        </div>
      </div>

      <div
        className={classNames(styles.drawer, {
          [styles.drawerOpen]: drawerOpen,
        })}
      >
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <button className={styles.backButton} onClick={handleBack}>
              <ArrowLeft width={12} height={12} />
              Back
            </button>
            <button
              className={styles.closeButton}
              onClick={() => setDrawerOpen(false)}
              aria-label="Close drawer"
            >
              <Xmark />
            </button>
          </div>
          <h2 className={styles.title}>{collection.name}</h2>
        </div>
        <div className={styles.listContainer}>
          <div className={styles.classList}>{classListContent}</div>
        </div>
      </div>

      {drawerOpen && (
        <div className={styles.overlay} onClick={() => setDrawerOpen(false)} />
      )}

      <button
        className={classNames(styles.floatingButton, {
          [styles.visible]: showFloatingButton,
        })}
        onClick={() => setDrawerOpen(true)}
        aria-label="Open collection classes"
      >
        <NavArrowRight />
      </button>

      <Flex direction="column" flexGrow="1" className={styles.view}>
        {classData ? (
          <Class class={classData} />
        ) : classLoading ? (
          <div className={styles.emptyState}>
            <p>Loading class details...</p>
          </div>
        ) : null}
      </Flex>
    </motion.div>
  );
}
