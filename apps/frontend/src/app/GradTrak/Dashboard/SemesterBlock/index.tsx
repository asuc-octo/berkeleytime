import React, { 
  useState, 
  useEffect, 
  useRef 
} from 'react';
import {
  Trash,
  BookStack,
  MoreHoriz
} from "iconoir-react";

import { Button } from "@repo/theme";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { ISelectedCourse } from '@/lib/api';
import AddClass from "../AddClass";
import ClassDetails from "../ClassDetails";
import styles from "./SemesterBlock.module.scss"
import { IPlanTerm } from '@/lib/api/plans';

import { useSetSelectedCourses } from "@/hooks/api";

interface SemesterBlockProps {
  planTerm: IPlanTerm;
  allSemesters: { [key: string]: ISelectedCourse[] }; 
  onTotalUnitsChange: (newTotal: number) => void;
  updateAllSemesters: (semesters: { [key: string]: ISelectedCourse[] }) => void;
};

function SemesterBlock({
  planTerm,
  onTotalUnitsChange,
  allSemesters,
  updateAllSemesters
}: SemesterBlockProps) {
  const semesterId = planTerm._id ? planTerm._id.trim() : "";

  const [isClassDetailsOpen, setIsClassDetailsOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<ISelectedCourse | null>(null);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [selectedClasses, setSelectedCourses] = useState<ISelectedCourse[]>(allSemesters[semesterId] || []);
  const [totalUnits, setTotalUnits] = useState(0);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [setCourses] = useSetSelectedCourses();

  useEffect(() => {
    const total = selectedClasses.reduce((sum, cls) => sum + cls.courseUnits, 0);
    setTotalUnits(total);
    onTotalUnitsChange(total);
  }, [selectedClasses, onTotalUnitsChange]);

  // update local state when allSemesters changes
  useEffect(() => {
    if (allSemesters[semesterId]) {
      setSelectedCourses(allSemesters[semesterId]);
    }
  }, [allSemesters, semesterId]);

  const handleDeleteClass = async (indexToDelete: number) => {
    const updatedClasses = selectedClasses.filter((_, index) => index !== indexToDelete);

    // update local state
    setSelectedCourses(updatedClasses);

    // update global state
    const updatedSemesters = {
      ...allSemesters,
      [semesterId]: updatedClasses
    };
    updateAllSemesters(updatedSemesters); updateAllSemesters(updatedSemesters);
    const deletedClassUnits = selectedClasses[indexToDelete].courseUnits;
    const newTotalUnits = totalUnits - deletedClassUnits;
    
    const oldClasses = [...selectedClasses];
    const newClasses = selectedClasses.filter((_, index) => index !== indexToDelete);
    setSelectedCourses(newClasses);
    try {
      await setCourses(semesterId, newClasses);
    } catch (error) {
      setSelectedCourses(oldClasses);
      console.error('Failed to save class:', error);
    }
    
    setTotalUnits(newTotalUnits);
    onTotalUnitsChange(newTotalUnits);
  };

  const handleClassDetails= (index: number) => {
    setClassToEdit(selectedClasses[index]);
    setIsClassDetailsOpen(true);
  };

  const addClass = async (cls: ISelectedCourse) => {
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
      console.error('Failed to save class:', error);
    }
    console.log("Updated classes:", updatedClasses)

    // update global state
    const updatedSemesters = {
      ...allSemesters,
      [semesterId]: updatedClasses
    };
    updateAllSemesters(updatedSemesters);
  }

  const findInsertPosition = (e: React.DragEvent) => {
    if (!containerRef.current) return 0;
    const mouseY = e.clientY;

    // get all class elements in this container
    const classElements = containerRef.current.querySelectorAll('[data-class-container]');

    // if no classes, insert at the beginning
    if (classElements.length === 0) {
      return 0;
    }

    // loop through class elements to find the insertion point
    for (let i = 0; i < classElements.length; i++) {
      const classRect = classElements[i].getBoundingClientRect();
      const classMidY = classRect.top + (classRect.height / 2);

      if (mouseY < classMidY) {
        return i;
      }
    }

    // if mouse is below all classes, insert at the end
    return classElements.length;
  };

  const handleUpdateClass = async (updatedClass: ISelectedCourse) => {
    console.log("Updating class:", updatedClass);
    const oldClasses = [...selectedClasses];
    const newClasses = selectedClasses.map((cls, ) =>
      cls.courseID === updatedClass.courseID ? updatedClass : cls
    );
    setSelectedCourses(newClasses);
    try {
      await setCourses(semesterId, newClasses);
    } catch (error) {
      setSelectedCourses(oldClasses);
      console.error('Failed to save class:', error);
    }

    // Recalculate total units
    const newTotalUnits = selectedClasses.reduce((total, cls) => {
      if (cls.courseID === updatedClass.courseID) {
        return total + updatedClass.courseUnits;
      }
      return total + cls.courseUnits;
    }, 0);


    setTotalUnits(newTotalUnits);
    onTotalUnitsChange(newTotalUnits);
    setIsClassDetailsOpen(false);
    setClassToEdit(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // only reset if leaving the entire container (not just moving between children)
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsDropTarget(false);
      setPlaceholderIndex(null);
    }
  }
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
  }

  const handleDragStart = (e: React.DragEvent, classIndex: number) => {
    // add visual indication for the dragged item
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add('dragging');
    }

    // store the semester ID and class index in the drag data
    e.dataTransfer.setData("application/json", JSON.stringify({
      sourceSemesterId: semesterId,
      classIndex: classIndex,
      class: selectedClasses[classIndex]
    }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // remove visual styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('dragging');
    }

    setPlaceholderIndex(null);
  }

  const handleDrop = (e: React.DragEvent) => {
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
      }
      // handle dragging between different semesters
      else {
        // remove class from source semester
        const sourceSemesterClasses = [...allSemesters[sourceSemesterId]];
        sourceSemesterClasses.splice(classIndex, 1);
        updatedSemesters[sourceSemesterId] = sourceSemesterClasses;

        // add class to target semester at the right position
        const targetSemesterClasses = [...selectedClasses];
        targetSemesterClasses.splice(insertPos, 0, draggedClass);
        updatedSemesters[semesterId] = targetSemesterClasses;
      }

      // update the global state
      updateAllSemesters(updatedSemesters); updateAllSemesters(updatedSemesters);
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  }

  return (
    <div ref={containerRef}
      className={`${styles.root} ${isDropTarget ? 'drop-target' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>
      <div className={styles.body}>
        <div className={styles.semesterCounter}>
          <h2>{planTerm.name} </h2>
          <p className={styles.counter}>{totalUnits}</p>
        </div>

        {/* Display selected classes outside the dialog */}
        {selectedClasses.map((cls, index) => (
          <React.Fragment key={`class-group-${index}`}>
            {placeholderIndex === index && (
              <div className={styles.placeholder}/>
            )}
            <div
              key={index}
              data-class-container
              className={styles.classContainer}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.start}>
                <div>
                  <h3 className={styles.title}>{cls.courseName}</h3>
                  <p >{cls.courseUnits} Units</p>
                </div>
                <div className={styles.dropdown}>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button className={styles.trigger}>
                          <MoreHoriz className={styles.moreHoriz}/> 
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      className={styles.content}
                      sideOffset={5}
                      align="end"
                    >
                      <DropdownMenu.Item
                        className={styles.menuItem}
                        onClick={() => handleClassDetails(index)}
                      >
                        <BookStack /> Edit Course Details
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className={styles.menuItem}
                        onClick={() => handleDeleteClass(index)}
                      >
                        <div className={styles.cancel}>
                          <Trash /> Delete Class
                        </div>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>

              {/* <div className={styles.tag}>
                <Book className={styles.icon}/>
                Major
              </div> */}
            </div>
          </React.Fragment>
        ))}

        {/* Dragging placeholder */}
        {placeholderIndex === selectedClasses.length && (
          <div className={styles.placeholder}/>
        )}

        {/* Dialog Component */}
        <AddClass 
          isOpen={isAddClassOpen} 
          setIsOpen={setIsAddClassOpen} 
          addClass={addClass} 
          handleOnConfirm={(cls) => { addClass(cls); }} 
        />

        {/* Edit Class Details Dialog */}
        {classToEdit && (
          <ClassDetails
            isOpen={isClassDetailsOpen}
            setIsOpen={setIsClassDetailsOpen}
            classData={classToEdit}
            onUpdate={handleUpdateClass}
          />
        )}

        <Button onClick={() => setIsAddClassOpen(true)} className={styles.addButton}>
          + Add Class
        </Button>
      </div>
    </div>

  )
}

export default SemesterBlock;