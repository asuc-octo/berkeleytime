import { useEffect, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Barcode,
  Calendar,
  Hashtag,
  MultiplePages,
  TaskList,
  Xmark,
} from "iconoir-react";

import { Button } from "@repo/theme";

import { ClassType } from "../types";
import styles from "./ClassDetails.module.scss";

interface ClassDetailsProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  classData?: ClassType;
  onUpdate?: (updatedClass: ClassType) => void;
  onConfirm?: (newClass: ClassType) => void;
}

const ClassDetails = ({
  isOpen,
  setIsOpen,
  classData,
  onUpdate,
  onConfirm,
}: ClassDetailsProps) => {
  const isEditMode = !!classData;

  const [classId, setClassId] = useState(classData?.id || "");
  const [className, setClassName] = useState(classData?.name || "");
  const [classTitle, setClassTitle] = useState(classData?.title || "");
  const [units, setUnits] = useState(classData?.units || 0);
  const [semester] = useState("Fall 2021");
  const [grading, setGrading] = useState(classData?.grading || "Graded");
  const [credit, setCredit] = useState(classData?.credit || "UC Berkeley");
  // const [requirements, setRequirements] = useState<string[]>([]);

  // Update state when classData changes
  useEffect(() => {
    if (isEditMode) {
      setClassId(classData!.id);
      setClassName(classData!.name);
      setClassTitle(classData!.title);
      setUnits(classData!.units);
      setGrading(classData!.grading || "Graded");
      setCredit(classData!.credit || "UC Berkeley");
    } else {
      setClassId("");
      setClassName("");
      setClassTitle("");
      setUnits(0);
      setGrading("Graded");
      setCredit("UC Berkeley");
    }
  }, [classData, isEditMode]);

  const handleSubmit = () => {
    const updatedClass = {
      id: classId,
      name: className,
      title: classTitle,
      units: units,
      grading: grading,
      credit: credit,
    };

    if (isEditMode && onUpdate) {
      onUpdate(updatedClass);
    } else if (!isEditMode && onConfirm) {
      onConfirm(updatedClass);
    }
    setIsOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>
              {isEditMode ? "Edit Course Details" : "Create Custom Class"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button className={styles.closeButton} aria-label="Close">
                <Xmark className={styles.icon} />
              </Button>
            </Dialog.Close>
          </div>

          <div className={styles.body}>
            <section className={styles.section}>
              <h3>Info</h3>
              <div className={styles.container}>
                <div className={styles.icon}>
                  <Barcode />
                </div>
                <input
                  type="text"
                  value={className}
                  placeholder="Add Class ID"
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div className={styles.container}>
                <div className={styles.icon}>
                  <MultiplePages />
                </div>
                <input
                  type="text"
                  value={classTitle}
                  placeholder="Add Class Title"
                  onChange={(e) => setClassTitle(e.target.value)}
                />
              </div>
            </section>

            <section className={styles.section}>
              <h3>Units</h3>
              <div className={styles.container}>
                <div className={styles.icon}>
                  <Hashtag />
                </div>
                <input
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  min="1"
                  max="12"
                />
              </div>
            </section>

            <section className={styles.section}>
              <h3>Requirements Fulfilled</h3>
              <div className={styles.container}>
                <div className={styles.icon}>
                  <TaskList />
                </div>
                <input type="text" value={semester} readOnly />
              </div>
            </section>

            <section className={styles.section}>
              <h3>Course tags</h3>
              <div className={styles.container}>
                <div className={styles.icon}>
                  <Calendar />
                </div>
                <input type="text" value={semester} readOnly />
              </div>
            </section>

            <section className={styles.section}>
              <h3>Grading</h3>
              <div className={styles.radio}>
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="grading"
                    checked={grading === "Graded"}
                    onChange={() => setGrading("Graded")}
                    className={styles.input}
                  />
                  <div className={styles.circle}>
                    {grading === "Graded" && <div className={styles.dot}></div>}
                  </div>
                  <p>Graded</p>
                </label>
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="grading"
                    checked={grading === "P/NP"}
                    onChange={() => setGrading("P/NP")}
                    className={styles.input}
                  />
                  <div className={styles.circle}>
                    {grading === "P/NP" && <div className={styles.dot}></div>}
                  </div>
                  <p>P/NP</p>
                </label>
              </div>
            </section>

            <section className={styles.section}>
              <h3>Credit</h3>
              <div className={styles.radio}>
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="credit"
                    checked={credit === "UC Berkeley"}
                    onChange={() => setCredit("UC Berkeley")}
                    className={styles.input}
                  />
                  <div className={styles.circle}>
                    {credit === "UC Berkeley" && (
                      <div className={styles.dot}></div>
                    )}
                  </div>
                  <p>UC Berkeley</p>
                </label>
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="credit"
                    checked={credit === "Transfer"}
                    onChange={() => setCredit("Transfer")}
                    className={styles.input}
                  />
                  <div className={styles.circle}>
                    {credit === "Transfer" && (
                      <div className={styles.dot}></div>
                    )}
                  </div>
                  <p>Transfer</p>
                </label>
              </div>
            </section>
          </div>

          <div className={styles.footer}>
            <Button
              variant="primary"
              className={styles.confirmButton}
              onClick={handleSubmit}
            >
              Confirm
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ClassDetails;
