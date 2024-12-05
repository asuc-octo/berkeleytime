import { useState } from "react";
import React from "react";

import { useMutation, useQuery } from "@apollo/client";
import { Camera, UserCircle } from "iconoir-react";
import _ from "lodash";

import { MetricName } from "@repo/shared";

import { MetricData } from "@/components/Class/Ratings/helper/metricsUtil";
import UserFeedbackModal from "@/components/UserFeedbackModal";
import { useReadUser } from "@/hooks/api";
import useClass from "@/hooks/useClass";
import {
  CREATE_RATING,
  GET_USER_RATINGS,
  READ_COURSE,
  Semester,
} from "@/lib/api";

import styles from "./Detail.module.scss";
import MyIcon2 from "./attended.svg";
import MyIcon1 from "./recorded.svg";

interface Props {
  attendanceRequired?: boolean;
  lecturesRecorded?: boolean;
  submissionAmount?: number;
}

interface ClassInfo {
  semester: string;
  year: number;
}

interface TermInfo {
  semester: Semester;
  year: number;
  value: string;
  label: string;
}

interface UserClass {
  subject: string;
  courseNumber: string;
  semester: Semester;
  year: number;
  classNumber: string;
}

export default function AttendanceRequirements({
  attendanceRequired = false,
  lecturesRecorded = false,
  submissionAmount = 0,
}: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const { class: currentClass } = useClass();
  const { data: user } = useReadUser();
  const { data: userRatingsData } = useQuery(GET_USER_RATINGS, {
    skip: !user,
  });
  const [createRating] = useMutation(CREATE_RATING, {
    refetchQueries: ["GetUserRatings", "GetCourseRatings"],
  });
  const { data: courseData } = useQuery(READ_COURSE, {
    variables: {
      subject: currentClass.subject,
      number: currentClass.courseNumber,
    },
  });
  const handleSubmitRatings = async (
    metricValues: MetricData,
    termInfo: { semester: Semester; year: number }
  ) => {
    console.log("Submitting ratings:", metricValues, "for term:", termInfo);
    try {
      await Promise.all(
        (Object.keys(MetricName) as Array<keyof typeof MetricName>)
          // TODO: Remove placeholder data before prod
          .filter((metric) => metric !== "Recommended")
          .map((metric) => {
            return createRating({
              variables: {
                subject: currentClass.subject,
                courseNumber: currentClass.courseNumber,
                semester: termInfo.semester,
                year: termInfo.year,
                classNumber: currentClass.number,
                metricName: metric,
                value: metricValues[MetricName[metric]],
              },
            });
          })
      );

      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting ratings:", error);
    }
  };

  const availableTerms = React.useMemo(() => {
    if (!courseData?.course?.classes) return [] as TermInfo[];

    return _.chain(courseData.course.classes as ClassInfo[])
      .map((classInfo: ClassInfo): TermInfo => ({
        value: `${classInfo.semester} ${classInfo.year}`,
        label: `${classInfo.semester} ${classInfo.year}`,
        semester: classInfo.semester as Semester,
        year: classInfo.year,
      }))
      .uniqBy((term: TermInfo) => `${term.semester}-${term.year}`)
      .orderBy(
        [
          'year',
          (term: TermInfo) => {
            const semesterOrder = {
              [Semester.Spring]: 0,
              [Semester.Summer]: 1,
              [Semester.Fall]: 2,
              [Semester.Winter]: 3,
            };
            return semesterOrder[term.semester];
          },
        ] as const,
        ['desc', 'asc']
      )
      .value() as TermInfo[];
  }, [courseData]);
  if (submissionAmount < 5) {
    return (
      <div className={styles.attendanceRequirements}>
        <p className={styles.label}>Attendance Requirements</p>
        <p className={styles.description}>
          No attendance information currently exists for this course.
        </p>
        <a
          href="#"
          className={styles.suggestEdit}
          onClick={(e) => {
            e.preventDefault();
            setModalOpen(true);
          }}
        >
          Taken this course? Help others by adding what you know. →
        </a>
        <UserFeedbackModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title="Rate Course"
          currentClass={currentClass}
          availableTerms={availableTerms}
          onSubmit={handleSubmitRatings}
          initialUserClass={userRatingsData?.userRatings?.classes?.find(
            (c: UserClass) =>
              c.subject === currentClass.subject &&
              c.courseNumber === currentClass.courseNumber &&
              c.semester === currentClass.semester &&
              c.year === currentClass.year &&
              c.classNumber === currentClass.number
          )}
        />
      </div>
    );
  }

  return (
    <div className={styles.attendanceRequirements}>
      <p className={styles.label}>Attendance Requirements</p>
      <div>
        {attendanceRequired ? (
          <UserCircle className={styles.icon} />
        ) : (
          <img className={styles.icon} src={MyIcon2} />
        )}
        <span className={styles.description}>
          {attendanceRequired
            ? "Attendance Required"
            : "Attendance Not Required"}
        </span>
      </div>

      <div className={styles.description}>
        {lecturesRecorded ? (
          <Camera className={styles.icon} />
        ) : (
          <img className={styles.icon} src={MyIcon1} />
        )}
        <span>
          {lecturesRecorded ? "Lectures Recorded" : "Lectures Not Recorded"}
        </span>
      </div>
      <a
        href="#"
        className={styles.suggestEdit}
        onClick={(e) => {
          e.preventDefault();
          setModalOpen(true);
        }}
      >
        Look inaccurate? Suggest an edit →{" "}
      </a>

      <UserFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Rate Course"
        currentClass={currentClass}
        availableTerms={availableTerms}
        onSubmit={handleSubmitRatings}
        initialUserClass={userRatingsData?.userRatings?.classes?.find(
          (c: UserClass) =>
            c.subject === currentClass.subject &&
            c.courseNumber === currentClass.courseNumber &&
            c.semester === currentClass.semester &&
            c.year === currentClass.year &&
            c.classNumber === currentClass.number
        )}
      />
    </div>
  );
}
