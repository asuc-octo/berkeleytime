import React, { useEffect, useRef, useState } from "react";

import Fuse from "fuse.js";
import {
  Check,
  Edit,
  List,
  MoreHoriz,
  NavArrowDown,
  NavArrowRight,
  Pin,
  PinSolid,
  Trash,
} from "iconoir-react";

import { Box, Button, DropdownMenu, Flex, Input } from "@repo/theme";

import { useReadCourseUnits, useSetSelectedCourses } from "@/hooks/api";
import { useRemovePlanTermByID } from "@/hooks/api/plans/useRemovePlanTermById";
import { ISelectedCourse } from "@/lib/api";
import { ILabel, IPlanTerm, Status, Terms } from "@/lib/api/plans";

import { SelectedCourse } from "../index";
import { GradTrakSettings } from "../settings";
import AddClass from "./AddClass";
import Class from "./Class";
import ClassDetails from "./ClassDetails";
import styles from "./SemesterBlock.module.scss";

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
  index: Fuse<{ title: string; name: string; alternateNames: string[] }> | null;
  handleUpdateTermName: (name: string) => void;
  handleTogglePin: () => void;
  handleSetStatus: (status: Status) => void;
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
  handleTogglePin,
  handleSetStatus,
}: SemesterBlockProps) {
  const semesterId = planTerm._id ? planTerm._id.trim() : "";

  const [isClassDetailsOpen, setIsClassDetailsOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<ISelectedCourse | null>(null);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [selectedClasses, setSelectedCourses] = useState<ISelectedCourse[]>(
    allSemesters[semesterId] || []
  );
  const [totalUnits, setTotalUnits] = useState(0);
  const [_pnpUnits, setPnpUnits] = useState(0);
  const [_transferUnits, setTransferUnits] = useState(0);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);

  const [setCourses] = useSetSelectedCourses();
  const [getCourseUnits] = useReadCourseUnits();

  const [rename, setRename] = useState(planTerm.name);
  const [renameDropdownOpen, setRenameDropdownOpen] = useState(false);

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
    setPnpUnits(pnp);
    const transfer = selectedClasses.reduce(
      (sum, cls) => sum + (cls.transfer ? cls.courseUnits : 0),
      0
    );
    setTransferUnits(transfer);
    onTotalUnitsChange(total, pnp, transfer);
  }, [selectedClasses]);

  // update local state when allSemesters changes
  useEffect(() => {
    if (allSemesters[semesterId]) {
      setSelectedCourses(allSemesters[semesterId]);
    }
  }, [allSemesters, semesterId]);

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
    updateAllSemesters(updatedSemesters);
    const deletedClassUnits = selectedClasses[indexToDelete].courseUnits;
    const newTotalUnits = totalUnits - deletedClassUnits;

    const oldClasses = [...selectedClasses];
    const newClasses = selectedClasses.filter(
      (_, index) => index !== indexToDelete
    );
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
    setPnpUnits(newPnpUnits);
    const newTransferUnits = updatedClasses.reduce(
      (sum, cls) => sum + (cls.transfer ? cls.courseUnits : 0),
      0
    );
    setTransferUnits(newTransferUnits);
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
      const data = await getCourseUnits(cls.courseSubject, cls.courseNumber);
      cls.courseUnits = data;
    }
    // Ensure all required fields are present
    const courseToAdd: ISelectedCourse = {
      courseID: cls.courseID || "custom-" + cls.courseName,
      courseName: cls.courseName || cls.courseID,
      courseTitle: cls.courseTitle || cls.courseName || cls.courseID,
      courseUnits: cls.courseUnits || 0,
      uniReqs: cls.uniReqs || [],
      collegeReqs: cls.collegeReqs || [],
      pnp: cls.pnp || false,
      transfer: cls.transfer || false,
      labels: cls.labels || [],
    };

    const oldClasses = [...selectedClasses];
    const updatedClasses = [...selectedClasses, courseToAdd];
    setSelectedCourses(updatedClasses);

    try {
      await setCourses(semesterId, updatedClasses);
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
      await setCourses(semesterId, newClasses);
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
    setPnpUnits(newPnpUnits);
    const newTransferUnits = updatedClassList.reduce(
      (sum, cls) => sum + (cls.transfer ? cls.courseUnits : 0),
      0
    );
    setTransferUnits(newTransferUnits);
    onTotalUnitsChange(newTotalUnits, newPnpUnits, newTransferUnits);
    setIsClassDetailsOpen(false);
    setClassToEdit(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // only reset if leaving the entire container (not just moving between children)
    if (
      containerRef.current &&
      !containerRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDropTarget(false);
      setPlaceholderIndex(null);
    }
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
    // remove visual styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("dragging");
    }

    setPlaceholderIndex(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    setPlaceholderIndex(null);

    try {
      // get the dragged class data
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const { sourceSemesterId, classIndex, class: draggedClass } = data;

      // find the insertion position
      const insertPos = findInsertPosition(e);

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
      updateAllSemesters(updatedSemesters);
      try {
        for (const semesterId of semestersToUpdate) {
          await setCourses(semesterId, updatedSemesters[semesterId], {
            fetchPolicy: "no-cache",
          });
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

  return (
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
            {planTerm.pinned && (
              <PinSolid className={styles.pin} onClick={handleTogglePin} />
            )}
            <h2>{planTerm.name}</h2>
            <p className={styles.counter}>{totalUnits}</p>
            {planTerm.status !== Status.None && (
              <span
                className={styles.status}
                style={{
                  backgroundColor:
                    planTerm.status === Status.Complete
                      ? "var(--emerald-500)"
                      : planTerm.status == Status.InProgress
                        ? "var(--yellow-500)"
                        : "var(--gray-500)",
                }}
              />
            )}
          </div>
          <Flex direction="row" gap="6px">
            <div className={styles.dropdown}>
              <DropdownMenu.Root
                open={renameDropdownOpen}
                onOpenChange={setRenameDropdownOpen}
              >
                <DropdownMenu.Trigger asChild>
                  <MoreHoriz className={styles.actionButton} />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  sideOffset={5}
                  align="end"
                  style={{ width: "160px" }}
                >
                  {planTerm.term === Terms.Misc && (
                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger onClick={() => {}}>
                        <Edit className={styles.menuIcon} /> Rename
                        <NavArrowRight
                          className={styles.rightAlignedIcon}
                          style={{ left: "48px" }}
                        />
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.SubContent sideOffset={2} alignOffset={-5}>
                        <Box width="200px" height="70px">
                          <Flex
                            direction="column"
                            justify="between"
                            height="100%"
                          >
                            <Input
                              placeholder={"Name your column..."}
                              value={rename}
                              onChange={(v) => setRename(v.target.value)}
                            />
                            <Flex
                              direction="row"
                              justify="end"
                              gap="5px"
                              width="100%"
                            >
                              <Button
                                onClick={() => {
                                  handleUpdateTermName(rename);
                                  setRenameDropdownOpen(false);
                                }}
                                disabled={!rename || rename === planTerm.name}
                              >
                                Save
                              </Button>
                            </Flex>
                          </Flex>
                        </Box>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Sub>
                  )}
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>
                      <List className={styles.menuIcon} /> Status
                      <NavArrowRight className={styles.rightAlignedIcon} />
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent sideOffset={2} alignOffset={-5}>
                      <DropdownMenu.Item
                        onClick={() => {
                          handleSetStatus(Status.Complete);
                        }}
                      >
                        <Flex direction="row" justify="between" width="100%">
                          <span>
                            <span
                              className={styles.menuStatusColor}
                              style={{ backgroundColor: "var(--emerald-500)" }}
                            />
                            Complete
                          </span>
                          {planTerm.status === Status.Complete && (
                            <Check className={styles.statusSelected} />
                          )}
                        </Flex>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => {
                          handleSetStatus(Status.InProgress);
                        }}
                      >
                        <Flex direction="row" justify="between" width="100%">
                          <span>
                            <span
                              className={styles.menuStatusColor}
                              style={{ backgroundColor: "var(--yellow-500)" }}
                            />
                            In Progress
                          </span>
                          {planTerm.status === Status.InProgress && (
                            <Check className={styles.statusSelected} />
                          )}
                        </Flex>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => {
                          handleSetStatus(Status.Incomplete);
                        }}
                      >
                        <Flex direction="row" justify="between" width="100%">
                          <span>
                            <span
                              className={styles.menuStatusColor}
                              style={{ backgroundColor: "var(--gray-500)" }}
                            />
                            Incomplete
                          </span>
                          {planTerm.status === Status.Incomplete && (
                            <Check className={styles.statusSelected} />
                          )}
                        </Flex>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => {
                          handleSetStatus(Status.None);
                        }}
                      >
                        <Flex direction="row" justify="between" width="100%">
                          None
                          {planTerm.status === Status.None && (
                            <Check className={styles.statusSelected} />
                          )}
                        </Flex>
                      </DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Sub>
                  <DropdownMenu.Item onClick={handleTogglePin}>
                    {planTerm.pinned ? (
                      <PinSolid className={styles.menuIcon} />
                    ) : (
                      <Pin className={styles.menuIcon} />
                    )}{" "}
                    Pin
                  </DropdownMenu.Item>
                  {/* <DropdownMenu.Item onClick={() => {}}>
                    <ShareIos className={styles.menuIcon} /> Export to Scheduler
                  </DropdownMenu.Item> */}
                  {/* <DropdownMenu.Item onClick={() => {}}>
                    <Eye className={styles.menuIcon} /> Hide
                  </DropdownMenu.Item> */}
                  <DropdownMenu.Item
                    onClick={() => {
                      removePlanTermByID(planTerm._id);
                    }}
                    isDelete
                  >
                    <Trash className={styles.menuIcon} /> Delete Column
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
            {open ? (
              <NavArrowDown
                className={styles.actionButton}
                onClick={() => {
                  setOpen(false);
                }}
              />
            ) : (
              <NavArrowRight
                className={styles.actionButton}
                onClick={() => {
                  setOpen(true);
                }}
              />
            )}
          </Flex>
        </Flex>

        {open && (
          <>
            {selectedClasses.map((cls, index) => (
              <React.Fragment key={`class-group-${index}`}>
                {placeholderIndex === index && (
                  <div className={styles.placeholder} />
                )}
                <Class
                  cls={cls}
                  index={index}
                  handleDragEnd={handleDragEnd}
                  handleDragStart={handleDragStart}
                  handleDetails={handleClassDetails}
                  handleDelete={handleDeleteClass}
                  settings={settings}
                  labels={labels}
                />
              </React.Fragment>
            ))}

            {/* Dragging placeholder */}
            {placeholderIndex === selectedClasses.length && (
              <div className={styles.placeholder} />
            )}

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
          </>
        )}
      </div>
    </div>
  );
}

export default SemesterBlock;
