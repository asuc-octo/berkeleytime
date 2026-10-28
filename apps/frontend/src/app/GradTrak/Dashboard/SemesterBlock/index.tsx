import React, { useEffect, useRef, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { Check, MoreHoriz, Trash } from "iconoir-react";

import { FuzzySearch } from "@repo/common";
import { Button, DropdownMenu, Flex, Input } from "@repo/theme";

import { DeleteScheduleDialog } from "@/components/ScheduleCard/DeleteScheduleDialog";
import { useReadCourseUnits, useSetSelectedCourses } from "@/hooks/api";
import { useRemovePlanTermByID } from "@/hooks/api/plans/useRemovePlanTermById";
import { ISelectedCourse } from "@/lib/api";
import { ILabel, IPlanTerm } from "@/lib/api/plans";
import { GetCourseRequirementsDocument, Status } from "@/lib/generated/graphql";

import { SelectedCourse } from "../index";
import { GradTrakSettings } from "../settings";
import AddClass from "./AddClass";
import Class from "./Class";
import ClassDetails from "./ClassDetails";
import styles from "./SemesterBlock.module.scss";

const STATUS_OPTIONS = [
  { status: Status.Complete, label: "Complete" },
  { status: Status.InProgress, label: "In Progress" },
  { status: Status.Incomplete, label: "Incomplete" },
] as const;

const getStatusColor = (status: Status | null | undefined) =>
  status === Status.Complete
    ? "var(--emerald-500)"
    : status === Status.InProgress
      ? "var(--yellow-500)"
      : "var(--gray-500)";

interface SemesterBlockProps {
  planTerm: IPlanTerm;
  allSemesters: { [key: string]: ISelectedCourse[] };
  onTotalUnitsChange: (
    newTotal: number,
    pnpUnits: number,
    transferUnits: number
  ) => void;
  updateAllSemesters: (semesters: { [key: string]: ISelectedCourse[] }) => void;
  settings: GradTrakSettings;
  labels: ILabel[];
  setShowLabelMenu: (v: boolean) => void;
  catalogCourses: SelectedCourse[];
  index: FuzzySearch<{
    title: string;
    name: string;
    alternateNames: string[];
  }> | null;
  handleUpdateTermName: (name: string) => void;
  handleSetStatus: (status: Status) => void;
  handleRemoveTerm: () => void;
  // Only the last semester can be removed, so columns stay contiguous.
  isLast: boolean;
}

function SemesterBlock({
  planTerm,
  onTotalUnitsChange,
  allSemesters,
  updateAllSemesters,
  settings,
  labels,
  setShowLabelMenu,
  catalogCourses,
  index,
  handleUpdateTermName,
  handleSetStatus,
  handleRemoveTerm,
  isLast,
}: SemesterBlockProps) {
  const semesterId = planTerm._id ? planTerm._id.trim() : "";

  const apolloClient = useApolloClient();

  const [isClassDetailsOpen, setIsClassDetailsOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<ISelectedCourse | null>(null);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [selectedClasses, setSelectedCourses] = useState<ISelectedCourse[]>(
    allSemesters[semesterId] || []
  );
  const [totalUnits, setTotalUnits] = useState(0);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingIndexRef = useRef<number | null>(null);

  const [setCourses] = useSetSelectedCourses();
  const [getCourseUnits] = useReadCourseUnits();

  const [rename, setRename] = useState(planTerm.name);
  const [renameEditActive, setRenameEditActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRename(planTerm.name);
  }, [planTerm.name]);

  useEffect(() => {
    if (renameEditActive && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renameEditActive]);

  const handleSaveRename = async () => {
    if (rename.trim() && rename !== planTerm.name) {
      handleUpdateTermName(rename.trim());
    } else {
      setRename(planTerm.name);
    }
    setRenameEditActive(false);
  };

  const handleCancelRename = () => {
    setRename(planTerm.name);
    setRenameEditActive(false);
  };

  useEffect(() => {
    const total = selectedClasses.reduce(
      (sum, cls) => sum + cls.courseUnits,
      0
    );
    setTotalUnits(total);
    const pnp = selectedClasses.reduce(
      (sum, cls) => sum + (cls.pnp ? cls.courseUnits : 0),
      0
    );
    const transfer = selectedClasses.reduce(
      (sum, cls) => sum + (cls.transfer ? cls.courseUnits : 0),
      0
    );
    onTotalUnitsChange(total, pnp, transfer);
  }, [selectedClasses]);

  // update local state when allSemesters changes
  useEffect(() => {
    if (allSemesters[semesterId]) {
      setSelectedCourses(allSemesters[semesterId]);
    }
  }, [allSemesters, semesterId]);

  // if a class was dragged out of this block and unmounted before dragend fired,
  // draggingIndexRef won't be reset — clear it when selectedClasses shrinks
  useEffect(() => {
    if (
      draggingIndexRef.current !== null &&
      draggingIndexRef.current >= selectedClasses.length
    ) {
      draggingIndexRef.current = null;
    }
  }, [selectedClasses.length]);

  const handleDeleteClass = async (indexToDelete: number) => {
    const updatedClasses = selectedClasses.filter(
      (_, index) => index !== indexToDelete
    );

    // update local state
    setSelectedCourses(updatedClasses);

    // update global state
    const updatedSemesters = {
      ...allSemesters,
      [semesterId]: updatedClasses,
    };
    updateAllSemesters(updatedSemesters);
    const deletedClassUnits = selectedClasses[indexToDelete].courseUnits;
    const newTotalUnits = totalUnits - deletedClassUnits;

    const oldClasses = [...selectedClasses];
    const newClasses = selectedClasses
      .filter((_, index) => index !== indexToDelete)
      .map((cls) => ({
        ...cls,
        course: undefined,
      }));
    setSelectedCourses(newClasses);
    try {
      await setCourses(semesterId, newClasses);
    } catch (error) {
      setSelectedCourses(oldClasses);
      console.error("Failed to save class:", error);
    }

    setTotalUnits(newTotalUnits);
    const newPnpUnits = updatedClasses.reduce(
      (sum, cls) => sum + (cls.pnp ? cls.courseUnits : 0),
      0
    );
    const newTransferUnits = updatedClasses.reduce(
      (sum, cls) => sum + (cls.transfer ? cls.courseUnits : 0),
      0
    );
    onTotalUnitsChange(newTotalUnits, newPnpUnits, newTransferUnits);
  };

  const handleClassDetails = (index: number) => {
    setClassToEdit(selectedClasses[index]);
    setIsClassDetailsOpen(true);
  };

  const addClass = async (cls: SelectedCourse | ISelectedCourse) => {
    // if missing units, get them
    if (
      cls.courseUnits <= 0 &&
      "courseSubject" in cls &&
      "courseNumber" in cls
    ) {
      const data = await getCourseUnits(
        cls.courseSubject,
        cls.courseNumber,
        planTerm.term,
        planTerm.year
      );
      cls.courseUnits = data;
    }

    const courseReqs =
      "courseSubject" in cls && "courseNumber" in cls
        ? await apolloClient.query({
            query: GetCourseRequirementsDocument,
            variables: {
              number: cls.courseNumber,
              subject: cls.courseSubject,
            },
          })
        : undefined;
    // Ensure all required fields are present
    const courseToAdd: ISelectedCourse = {
      courseID: cls.courseID || "custom-" + cls.courseName,
      courseName: cls.courseName || cls.courseID,
      courseTitle: cls.courseTitle || cls.courseName || cls.courseID,
      courseUnits: cls.courseUnits || 0,
      pnp: cls.pnp || false,
      transfer: cls.transfer || false,
      labels: cls.labels || [],
      course: courseReqs?.data?.course || undefined,
    };

    console.log(courseToAdd);

    const oldClasses = [...selectedClasses];
    const updatedClasses = [...selectedClasses, courseToAdd];
    setSelectedCourses(updatedClasses);

    try {
      await setCourses(
        semesterId,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        updatedClasses.map(({ course: _course, ...cls }) => cls)
      );
    } catch (error) {
      setSelectedCourses(oldClasses);
      console.error("Failed to save class:", error);
    }

    // update global state
    const updatedSemesters = {
      ...allSemesters,
      [semesterId]: updatedClasses,
    };
    updateAllSemesters(updatedSemesters);
  };

  const findInsertPosition = (e: React.DragEvent) => {
    if (!containerRef.current) return 0;
    const mouseY = e.clientY;

    // get all class elements in this container
    const classElements = containerRef.current.querySelectorAll(
      "[data-class-container]"
    );

    // if no classes, insert at the beginning
    if (classElements.length === 0) {
      return 0;
    }

    // loop through class elements to find the insertion point
    for (let i = 0; i < classElements.length; i++) {
      const classRect = classElements[i].getBoundingClientRect();
      const classMidY = classRect.top + classRect.height / 2;

      if (mouseY < classMidY) {
        return i;
      }
    }

    // if mouse is below all classes, insert at the end
    return classElements.length;
  };

  const handleUpdateClass = async (updatedClass: ISelectedCourse) => {
    const oldClasses = [...selectedClasses];
    const newClasses = selectedClasses.map((cls) =>
      cls.courseID === updatedClass.courseID ? updatedClass : cls
    );
    setSelectedCourses(newClasses);
    try {
      await setCourses(
        semesterId,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        newClasses.map(({ course: _course, ...cls }) => cls)
      );
    } catch (error) {
      setSelectedCourses(oldClasses);
      console.error("Failed to save class:", error);
    }

    // Recalculate total units
    const newTotalUnits = selectedClasses.reduce((total, cls) => {
      if (cls.courseID === updatedClass.courseID) {
        return total + updatedClass.courseUnits;
      }
      return total + cls.courseUnits;
    }, 0);

    setTotalUnits(newTotalUnits);
    const updatedClassList = selectedClasses.map((cls) =>
      cls.courseID === updatedClass.courseID ? updatedClass : cls
    );
    const newPnpUnits = updatedClassList.reduce(
      (sum, cls) => sum + (cls.pnp ? cls.courseUnits : 0),
      0
    );
    const newTransferUnits = updatedClassList.reduce(
      (sum, cls) => sum + (cls.transfer ? cls.courseUnits : 0),
      0
    );
    onTotalUnitsChange(newTotalUnits, newPnpUnits, newTransferUnits);
    setIsClassDetailsOpen(false);
    setClassToEdit(null);

    // update global state
    const updatedSemesters = {
      ...allSemesters,
      [semesterId]: newClasses,
    };
    updateAllSemesters(updatedSemesters);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (
      e.clientX > rect.left &&
      e.clientX < rect.right &&
      e.clientY > rect.top &&
      e.clientY < rect.bottom
    ) {
      return; // cursor still inside, ignore bubbled leave from a child
    }
    setIsDropTarget(false);
    setPlaceholderIndex(null);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
    setIsDropTarget(true);

    try {
      // find where to insert
      const insertPos = findInsertPosition(e);
      setPlaceholderIndex(insertPos);
    } catch (error) {
      console.error("Error in dragover:", error);
    }
  };

  const handleDragStart = (e: React.DragEvent, classIndex: number) => {
    draggingIndexRef.current = classIndex;
    // add visual indication for the dragged item
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("dragging");
    }

    // store the semester ID and class index in the drag data
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        sourceSemesterId: semesterId,
        classIndex: classIndex,
        class: selectedClasses[classIndex],
      })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    draggingIndexRef.current = null;
    // remove visual styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("dragging");
    }

    setPlaceholderIndex(null);
  };

  const BOOKMARK_DRAG_TYPE = "application/x-gradtrak-bookmark-class";

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    setPlaceholderIndex(null);

    try {
      const insertPos = findInsertPosition(e);

      // Drop from bookmarks sidebar: add class at position
      if (e.dataTransfer.types.includes(BOOKMARK_DRAG_TYPE)) {
        const raw = e.dataTransfer.getData(BOOKMARK_DRAG_TYPE);
        const { class: bookmarkClass } = JSON.parse(raw) as {
          source: string;
          class: {
            subject: string;
            courseNumber: string;
            number: string;
            title: string;
            unitsMin?: number;
            unitsMax?: number;
          };
        };
        const { subject, courseNumber, number, title, unitsMin, unitsMax } =
          bookmarkClass;
        let courseUnits = unitsMin ?? unitsMax ?? 0;
        if (courseUnits <= 0) {
          courseUnits = await getCourseUnits(
            subject,
            courseNumber,
            planTerm.term,
            planTerm.year
          );
        }
        const courseToAdd: ISelectedCourse = {
          courseID: `${subject}_${number}`,
          courseName: `${subject} ${courseNumber}`,
          courseTitle: title || `${subject} ${courseNumber}`,
          courseUnits,
          uniReqs: [],
          collegeReqs: [],
          pnp: false,
          transfer: false,
          labels: [],
        };
        const updatedClasses = [...selectedClasses];
        updatedClasses.splice(insertPos, 0, courseToAdd);
        const oldClasses = [...selectedClasses];
        setSelectedCourses(updatedClasses);
        try {
          await setCourses(semesterId, updatedClasses);
          const updatedSemesters = {
            ...allSemesters,
            [semesterId]: updatedClasses,
          };
          updateAllSemesters(updatedSemesters);
        } catch (error) {
          setSelectedCourses(oldClasses);
          console.error("Failed to add class from bookmarks:", error);
        }
        return;
      }

      // get the dragged class data (from another semester block)
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const { sourceSemesterId, classIndex, class: draggedClass } = data;

      // create updated semesters object
      const updatedSemesters = { ...allSemesters };
      const semestersToUpdate: string[] = [];

      // handle dragging within the same semester
      if (sourceSemesterId === semesterId) {
        const updatedClasses = [...selectedClasses];

        // remove from original position
        updatedClasses.splice(classIndex, 1);

        // adjust insert position if needed
        const adjustedPos = classIndex < insertPos ? insertPos - 1 : insertPos;

        // insert at new position
        updatedClasses.splice(adjustedPos, 0, draggedClass);
        updatedSemesters[semesterId] = updatedClasses;
        semestersToUpdate.push(semesterId);
      }
      // handle dragging between different semesters
      else {
        // remove class from source semester
        const sourceSemesterClasses = [...allSemesters[sourceSemesterId]];
        sourceSemesterClasses.splice(classIndex, 1);
        updatedSemesters[sourceSemesterId] = sourceSemesterClasses;
        semestersToUpdate.push(sourceSemesterId);

        // add class to target semester at the right position
        const targetSemesterClasses = [...selectedClasses];
        targetSemesterClasses.splice(insertPos, 0, draggedClass);
        updatedSemesters[semesterId] = targetSemesterClasses;
        semestersToUpdate.push(semesterId);
      }

      // update the global state
      const oldSemesters = { ...allSemesters };
      updateAllSemesters(updatedSemesters);
      try {
        for (const semesterId of semestersToUpdate) {
          await setCourses(
            semesterId,
            updatedSemesters[semesterId].map(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ({ course: _course, ...cls }) => cls
            ),
            {
              fetchPolicy: "no-cache",
            }
          );
        }
      } catch (error) {
        updateAllSemesters(oldSemesters);
        console.error("Error handling drop:", error);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  const [removePlanTermByID] = useRemovePlanTermByID();
  const [confirmDeleteSemesterOpen, setConfirmDeleteSemesterOpen] =
    useState(false);
  const [confirmDeleteClassIndex, setConfirmDeleteClassIndex] = useState<
    number | null
  >(null);

  return (
    <>
      <div
        ref={containerRef}
        className={`${styles.root} ${isDropTarget ? "drop-target" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.body} data-layout={settings.layout}>
          <Flex direction="row" justify="between" width="100%">
            <div className={styles.semesterCounter}>
              <h2>
                {renameEditActive ? (
                  <Input
                    ref={inputRef}
                    value={rename}
                    onChange={(e) => setRename(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveRename();
                      } else if (e.key === "Escape") {
                        handleCancelRename();
                      }
                    }}
                    onBlur={handleSaveRename}
                    style={{ width: "100%", minWidth: "120px" }}
                  />
                ) : (
                  <span
                    onClick={() => {
                      setRenameEditActive(true);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {planTerm.name}
                  </span>
                )}
              </h2>
              <p className={styles.counter}>{totalUnits}</p>
              <span
                className={styles.status}
                style={{ backgroundColor: getStatusColor(planTerm.status) }}
              />
            </div>
            <Flex direction="row" gap="6px">
              {/* Status is the only per-semester menu action: pinning and
                  deleting arbitrary columns were removed. */}
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className={styles.statusButton}
                    aria-label="Set status"
                  >
                    <MoreHoriz />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content sideOffset={5} align="end">
                  {STATUS_OPTIONS.map(({ status, label }) => (
                    <DropdownMenu.Item
                      key={status}
                      onClick={() => handleSetStatus(status)}
                    >
                      <Flex direction="row" justify="between" width="100%">
                        <span>
                          <span
                            className={styles.menuStatusColor}
                            style={{ backgroundColor: getStatusColor(status) }}
                          />
                          {label}
                        </span>
                        {planTerm.status === status && (
                          <Check className={styles.statusSelected} />
                        )}
                      </Flex>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
              {/* Semesters are removed like a stack, from the end only. */}
              {isLast && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  aria-label={`Delete ${planTerm.name}`}
                  onClick={() => setConfirmDeleteSemesterOpen(true)}
                >
                  <Trash />
                </button>
              )}
            </Flex>
          </Flex>

          {selectedClasses.map((cls, index) => (
            <React.Fragment key={`class-group-${index}`}>
              {placeholderIndex === index &&
                !(
                  draggingIndexRef.current !== null &&
                  (placeholderIndex === draggingIndexRef.current ||
                    placeholderIndex === draggingIndexRef.current + 1)
                ) && <div className={styles.placeholder} />}
              <Class
                cls={cls}
                index={index}
                handleDragEnd={handleDragEnd}
                handleDragStart={handleDragStart}
                handleDetails={handleClassDetails}
                handleDelete={(i) => setConfirmDeleteClassIndex(i)}
                settings={settings}
                labels={labels}
                draggable
              />
            </React.Fragment>
          ))}

          {/* Dragging placeholder */}
          {placeholderIndex === selectedClasses.length &&
            !(
              draggingIndexRef.current !== null &&
              (placeholderIndex === draggingIndexRef.current ||
                placeholderIndex === draggingIndexRef.current + 1)
            ) && <div className={styles.placeholder} />}

          {/* Dialog Component */}
          <AddClass
            isOpen={isAddClassOpen}
            setIsOpen={setIsAddClassOpen}
            addClass={addClass}
            handleOnConfirm={(cls) => {
              addClass(cls);
            }}
            labels={labels}
            setShowLabelMenu={setShowLabelMenu}
            catalogCourses={catalogCourses}
            index={index}
          />

          {/* Edit Class Details Dialog */}
          {classToEdit && (
            <ClassDetails
              isOpen={isClassDetailsOpen}
              setIsOpen={setIsClassDetailsOpen}
              classData={classToEdit}
              onUpdate={handleUpdateClass}
              allLabels={labels}
              setShowLabelMenu={setShowLabelMenu}
            />
          )}

          <Button
            onClick={() => setIsAddClassOpen(true)}
            className={styles.addButton}
          >
            + Add Class
          </Button>
        </div>
      </div>
      <DeleteScheduleDialog
        isOpen={confirmDeleteSemesterOpen}
        onClose={() => setConfirmDeleteSemesterOpen(false)}
        title="Delete Semester"
        message={
          <>
            Are you sure you want to delete <strong>{planTerm.name}</strong>?
            All courses in this semester will be removed.
          </>
        }
        onConfirm={async () => {
          try {
            await removePlanTermByID(planTerm._id);
            handleRemoveTerm();
          } catch {
            return;
          }
          onTotalUnitsChange(0, 0, 0);
          setConfirmDeleteSemesterOpen(false);
        }}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
      <DeleteScheduleDialog
        isOpen={confirmDeleteClassIndex !== null}
        onClose={() => setConfirmDeleteClassIndex(null)}
        title="Delete Class"
        message={
          <>
            Are you sure you want to delete{" "}
            <strong>
              {confirmDeleteClassIndex !== null
                ? selectedClasses[confirmDeleteClassIndex]?.courseName
                : ""}
            </strong>
            ?
          </>
        }
        onConfirm={async () => {
          if (confirmDeleteClassIndex !== null) {
            handleDeleteClass(confirmDeleteClassIndex);
            setConfirmDeleteClassIndex(null);
          }
        }}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </>
  );
}

export default SemesterBlock;
