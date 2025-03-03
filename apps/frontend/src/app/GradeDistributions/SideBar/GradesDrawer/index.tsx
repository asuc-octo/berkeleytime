import { useMemo, useState } from "react";

import { ArrowLeft, Plus, Xmark } from "iconoir-react";
import Select, { SingleValue } from "react-select";

import { Button, IconButton } from "@repo/theme";

import Drawer from "@/components/Drawer";
import { useReadCourseWithInstructor } from "@/hooks/api";
import { ICourse } from "@/lib/api";

import styles from "./GradesDrawer.module.scss";

type OptionType = {
  value: string;
  label: string;
};

interface GradesDrawerProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addCourse: (course: ICourse, term: string, instructor: string) => void;
  back: () => void;
  course: ICourse;
}

const DEFAULT_SELECTED_INSTRUCTOR = { value: "all", label: "All Instructors" };
const DEFAULT_SELECTED_SEMESTER = { value: "all", label: "All Semesters" };
const DEFAULT_BY_OPTION = { value: "instructor", label: "By Instructor" };

const byOptions = [
  { value: "instructor", label: "By Instructor" },
  { value: "semester", label: "By Semester" },
];

export default function GradesDrawer({
  open,
  setOpen,
  addCourse,
  back,
  course,
}: GradesDrawerProps) {
  const { data: courseData } = useReadCourseWithInstructor(
    course.subject,
    course.number
  );

  const [byData, setByData] =
    useState<SingleValue<OptionType>>(DEFAULT_BY_OPTION);
  const [selectedInstructor, setSelectedInstructor] = useState<
    SingleValue<OptionType>
  >(DEFAULT_SELECTED_INSTRUCTOR);
  const [selectedSemester, setSelectedSemester] = useState<
    SingleValue<OptionType>
  >(DEFAULT_SELECTED_SEMESTER);

  // some crazy cyclic dependencies here, averted by the fact that options changes
  // dpeend on the value of the "byData"
  const instructorOptions: OptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_INSTRUCTOR];
    if (!courseData) return list;

    const mySet = new Set();
    courseData?.classes.forEach((c) => {
      if (byData?.value === "semester") {
        if (`${c.semester} ${c.year}` !== selectedSemester?.value) return;
      }
      c.primarySection.meetings.forEach((m) => {
        m.instructors.forEach((i) => {
          mySet.add(`${i.familyName}, ${i.givenName}`);
        });
      });
    });
    courseData?.classes.map((c) => {
      return `${c.primarySection.meetings[0]} ${c.year}`;
    });
    const opts = [...mySet].map((v) => {
      return { value: v as string, label: v as string };
    });
    if (opts.length === 1 && byData?.value === "semester") {
      if (selectedInstructor !== opts[0]) setSelectedInstructor(opts[0]);
      return opts;
    }
    return [...list, ...opts];
  }, [courseData, selectedSemester, byData]);

  const semesterOptions: OptionType[] = useMemo(() => {
    const list = [DEFAULT_SELECTED_SEMESTER];
    if (!courseData) return list;
    const filteredClasses =
      byData?.value === "semester"
        ? courseData.classes
        : selectedInstructor?.value === "all"
          ? []
          : courseData.classes.filter((c) =>
              c.primarySection.meetings.find((m) =>
                m.instructors.find(
                  (i) =>
                    selectedInstructor?.value ===
                    `${i.familyName}, ${i.givenName}`
                )
              )
            );
    const filteredOptions = Array.from(
      new Set(filteredClasses.map((c) => `${c.semester} ${c.year}`))
    ).map((t) => {
      return {
        value: t,
        label: t,
      };
    });
    if (filteredOptions.length == 1) {
      if (selectedSemester != filteredOptions[0])
        setSelectedSemester(filteredOptions[0]);
      return filteredOptions;
    }
    return [...list, ...filteredOptions];
  }, [courseData, selectedInstructor, byData]);

  return (
    <Drawer.Left
      open={open}
      changeOpen={setOpen}
      content={
        courseData && (
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.row}>
                <IconButton onClick={back}>
                  <ArrowLeft />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <Xmark />
                </IconButton>
              </div>
              <div className={styles.heading}>
                {courseData.subject} {courseData.number}
              </div>
              <div className={styles.description}>{courseData.title}</div>
            </div>
            <div className={styles.body}>
              <div className={styles.selectCont}>
                <Select
                  options={byOptions}
                  value={byData}
                  onChange={(s) => {
                    setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR);
                    setSelectedSemester(DEFAULT_SELECTED_SEMESTER);
                    setByData(s);
                  }}
                />
              </div>
              <div className={styles.selectCont}>
                {byData?.value === "instructor" ? (
                  <Select
                    options={instructorOptions}
                    value={selectedInstructor}
                    onChange={(s) => {
                      setSelectedInstructor(s);
                    }}
                  />
                ) : (
                  <Select
                    options={semesterOptions}
                    value={selectedSemester}
                    onChange={(s) => {
                      setSelectedSemester(s);
                    }}
                  />
                )}
              </div>
              <div className={styles.selectCont}>
                {byData?.value === "semester" ? (
                  <Select
                    options={instructorOptions}
                    value={selectedInstructor}
                    onChange={(s) => {
                      setSelectedInstructor(s);
                    }}
                  />
                ) : (
                  <Select
                    options={semesterOptions}
                    value={selectedSemester}
                    onChange={(s) => {
                      setSelectedSemester(s);
                    }}
                  />
                )}
              </div>

              <Button
                className={styles.button}
                variant="solid"
                onClick={() => {
                  if (!selectedSemester || !selectedInstructor) return;
                  addCourse(
                    course,
                    selectedSemester.value,
                    selectedInstructor.value
                  );
                  setOpen(false);
                  setSelectedInstructor(DEFAULT_SELECTED_INSTRUCTOR);
                  setSelectedSemester(DEFAULT_SELECTED_SEMESTER);
                }}
              >
                Add course
                <Plus />
              </Button>
            </div>
          </div>
        )
      }
    />
  );
}
