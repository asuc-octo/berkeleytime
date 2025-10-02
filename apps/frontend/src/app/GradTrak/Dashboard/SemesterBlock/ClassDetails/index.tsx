import { useEffect, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import {
  Barcode,
  Hashtag,
  MultiplePages,
  TaskList,
  Xmark,
} from "iconoir-react";

import { Box, Button, Color, Select } from "@repo/theme";

import { ILabel, ISelectedCourse } from "@/lib/api";

import styles from "./ClassDetails.module.scss";

interface ClassDetailsProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  classData?: ISelectedCourse;
  onUpdate?: (updatedClass: ISelectedCourse) => void;
  onConfirm?: (newClass: ISelectedCourse) => void;
  allLabels: ILabel[];
  setShowLabelMenu: (v: boolean) => void;
}

const ClassDetails = ({
  isOpen,
  setIsOpen,
  classData,
  onUpdate,
  onConfirm,
  allLabels,
  setShowLabelMenu,
}: ClassDetailsProps) => {
  const isEditMode = !!classData;

  const [classId, setClassId] = useState(classData?.courseID || "");
  const [className, setClassName] = useState(classData?.courseName || "");
  const [classTitle, setClassTitle] = useState(classData?.courseTitle || "");
  const [units, setUnits] = useState(classData?.courseUnits || 0);
  const [semester] = useState("Coming Soon");
  const [grading, setGrading] = useState(classData?.pnp ? "P/NP" : "Graded");
  const [credit, setCredit] = useState(
    classData?.transfer ? "Transfer" : "UC Berkeley"
  );
  // const [requirements, setRequirements] = useState<string[]>([]);
  const [labels, setLabels] = useState(
    classData?.labels.map((l) => {
      return {
        name: l.name,
        color: l.color,
      };
    }) ?? []
  );

  // Update state when classData changes
  useEffect(() => {
    if (classData && isEditMode) {
      setClassId(classData!.courseID);
      setClassName(classData!.courseName);
      setClassTitle(classData!.courseTitle);
      setUnits(classData!.courseUnits);
      setLabels(classData!.labels);
    } else {
      setClassId("");
      setClassName("");
      setClassTitle("");
      setUnits(0);
    }
  }, [classData, isEditMode]);

  const handleSubmit = () => {
    const updatedClass = {
      courseID: classId,
      courseName: className,
      courseTitle: classTitle,
      courseUnits: units,
      uniReqs: [],
      collegeReqs: [],
      pnp: grading === "P/NP",
      transfer: credit === "Transfer",
      labels: labels
        .filter((l) =>
          allLabels.some(
            (availableLabel) =>
              availableLabel.name === l.name && availableLabel.color === l.color
          )
        )
        .map((l) => {
          return {
            name: l.name,
            color: l.color,
          };
        }),
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
              <Box style={{ minWidth: "100%" }}>
                <Select
                  multi
                  checkboxMulti
                  addOption={{
                    text: "Create New Label",
                    onClick: () => {
                      setShowLabelMenu(true);
                    },
                  }}
                  value={(() => {
                    const filteredLabels = labels.filter((l) =>
                      allLabels.some(
                        (availableLabel) =>
                          availableLabel.name === l.name &&
                          availableLabel.color === l.color
                      )
                    );
                    return filteredLabels.length > 0 ? filteredLabels : null;
                  })()}
                  onChange={(vs) => {
                    if (!vs) setLabels([]);
                    if (Array.isArray(vs)) setLabels(vs);
                  }}
                  options={allLabels.map((l) => {
                    return {
                      value: {
                        name: l.name,
                        color: l.color,
                      },
                      label: l.name,
                      color: l.color as Color,
                    };
                  })}
                />
              </Box>
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
