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

import AddClass from "../AddClass";
// import EditClassDetails from "../EditClassDetails";
import styles from "./SemesterBlock.module.scss"


interface SemesterYearProps {
  selectedYear: number | string;
  selectedSemester: string;
  semesterId: string; // id for every semester
  allSemesters: { [key: string]: ClassType[] }; // every semester and their classes
  onTotalUnitsChange: (newTotal: number) => void;
  updateAllSemesters: (semesters: { [key: string]: ClassType[] }) => void;
};

type ClassType = {
  id: number;
  name: string;
  units: number;
};

function SemesterBlock({ selectedYear,
  selectedSemester,
  onTotalUnitsChange,
  semesterId,
  allSemesters,
  updateAllSemesters
}: SemesterYearProps) {
  const [, setIsEditClassOpen] = useState(false);
  const [, setClassToEdit] = useState<ClassType | null>(null);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<ClassType[]>(allSemesters[semesterId] || []);
  const [totalUnits, setTotalUnits] = useState(0);
  // const [isCustomClassOpen, setIsCustomClassOpen] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const total = selectedClasses.reduce((sum, cls) => sum + cls.units, 0);
    setTotalUnits(total);
    onTotalUnitsChange(total);
  }, [selectedClasses, onTotalUnitsChange]);

  // update local state when allSemesters changes
  useEffect(() => {
    if (allSemesters[semesterId]) {
      setSelectedClasses(allSemesters[semesterId]);
    }
  }, [allSemesters, semesterId]);

  // const openCustomClass = () => setIsCustomClassOpen(true);
  // const closeCustomClass = () => {
  //   setIsCustomClassOpen(false);
  // };

  const handleDeleteClass = (indexToDelete: number) => {
    const updatedClasses = selectedClasses.filter((_, index) => index !== indexToDelete);

    // update local state
    setSelectedClasses(updatedClasses);

    // update global state
    const updatedSemesters = {
      ...allSemesters,
      [semesterId]: updatedClasses
    };
    updateAllSemesters(updatedSemesters); updateAllSemesters(updatedSemesters);
    const deletedClassUnits = selectedClasses[indexToDelete].units;
    const newTotalUnits = totalUnits - deletedClassUnits;
    setSelectedClasses((prevClasses) =>
      prevClasses.filter((_, index) => index !== indexToDelete)
    );
    setTotalUnits(newTotalUnits);
    onTotalUnitsChange(newTotalUnits);
    // setTotalUnits((prevTotalUnits) => prevTotalUnits - deletedClassUnits);
  };

  const handleEditClass = (index: number) => {
    setClassToEdit(selectedClasses[index]);
    setIsEditClassOpen(true);
  };

  const addClass = (cls: ClassType) => {
    const updatedClasses = [...selectedClasses, cls];

    // update local state
    setSelectedClasses(updatedClasses);

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

  // const handleUpdateClass = (updatedClass: ClassType) => {
  //   setSelectedClasses((prevClasses) =>
  //     prevClasses.map((cls, ) =>
  //       cls.id === updatedClass.id ? updatedClass : cls
  //     )
  //   );

  //   // Recalculate total units
  //   const newTotalUnits = selectedClasses.reduce((total, cls) => {
  //     if (cls.id === updatedClass.id) {
  //       return total + updatedClass.units;
  //     }
  //     return total + cls.units;
  //   }, 0);


  //   setTotalUnits(newTotalUnits);
  //   onTotalUnitsChange(newTotalUnits);
  //   setIsEditClassOpen(false);
  //   setClassToEdit(null);
  // };

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
          <h2>{selectedSemester} {selectedYear} </h2>
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
                  <h3 className={styles.title}>{cls.name}</h3>
                  <p >{cls.units} Units</p>
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
                        onClick={() => handleEditClass(index)}
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
            </div>
          </React.Fragment>
        ))}

        {/* Dragging placeholder */}
        {placeholderIndex === selectedClasses.length && (
          <div className={styles.placeholder}/>
        )}

        {/* Dialog Component */}
        <AddClass isOpen={isAddClassOpen} setIsOpen={setIsAddClassOpen} addClass={addClass} handleOnConfirm={(cls) => { addClass(cls); }} />

        {/* Edit Class Details Dialog */}
        {/* {classToEdit && (
          <EditClassDetails
            isOpen={isEditClassOpen}
            setIsOpen={setIsEditClassOpen}
            classData={classToEdit}
            onUpdate={handleUpdateClass}
          />
        )} */}

        <Button onClick={() => setIsAddClassOpen(true)} className={styles.addButton}>
          + Add Class
        </Button>
      </div>
    </div>

  )
}

export default SemesterBlock;