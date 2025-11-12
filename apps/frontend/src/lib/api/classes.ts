import { gql } from "@apollo/client";

import { GET_CANONICAL_CATALOG_QUERY } from "@repo/shared";

import {
  AcademicCareer,
  Component,
  Exam,
  GetCanonicalCatalogQuery,
  GetClassQuery,
  Instructor,
  Meeting,
  SectionAttribute,
  SectionAttributeInfo,
} from "../generated/graphql";

export const READ_CLASS = gql`
  query GetClass(
    $year: Int!
    $semester: Semester!
    $sessionId: SessionIdentifier
    $subject: String!
    $courseNumber: CourseNumber!
    $number: ClassNumber!
  ) {
    class(
      year: $year
      semester: $semester
      sessionId: $sessionId
      subject: $subject
      courseNumber: $courseNumber
      number: $number
    ) {
      year
      semester
      subject
      sessionId
      courseNumber
      number
      title
      description
      unitsMax
      unitsMin
      gradingBasis
      finalExam
      gradeDistribution {
        average
        pnpPercentage
        distribution {
          letter
          count
        }
      }
      course {
        title
        description
        aggregatedRatings {
          metrics {
            categories {
              count
              value
            }
            count
            metricName
            weightedAverage
          }
        }
        gradeDistribution {
          average
          pnpPercentage
          distribution {
            letter
            count
          }
        }
        academicCareer
        requirements
        requiredCourses {
          subject
          number
        }
        classes {
          semester
          year
          number
          anyPrintInScheduleOfClasses
          primarySection {
            meetings {
              instructors {
                familyName
                givenName
              }
            }
          }
        }
      }
      primarySection {
        number
        sectionId
        component
        online
        attendanceRequired
        lecturesRecorded
        startDate
        endDate
        enrollment {
          latest {
            startTime
            endTime
            granularitySeconds
            status
            enrolledCount
            maxEnroll
            waitlistedCount
            maxWaitlist
            seatReservationCount {
              enrolledCount
              maxEnroll
              number
            }
          }
          seatReservationTypes {
            fromDate
            number
            requirementGroup
          }
        }
        meetings {
          days
          location
          endTime
          startTime
          instructors {
            familyName
            givenName
          }
        }
        exams {
          date
          type
          location
          startTime
          endTime
        }
      }
      sections {
        number
        sectionId
        component
        online
        attendanceRequired
        lecturesRecorded
        startDate
        endDate
        enrollment {
          latest {
            startTime
            endTime
            granularitySeconds
            status
            enrolledCount
            maxEnroll
            waitlistedCount
            maxWaitlist
          }
        }
        meetings {
          days
          location
          endTime
          startTime
          instructors {
            familyName
            givenName
          }
        }
        exams {
          date
          type
          location
          startTime
          endTime
        }
      }
    }
  }
`;

export type IClass = NonNullable<GetClassQuery["class"]>;
export type ISection = NonNullable<IClass["sections"]>[number];
export type IClassCourse = IClass["course"];

export type IInstructor = ISection["meetings"][number]["instructors"][number];
export type IExam = ISection["exams"][number];
export type IMeeting = ISection["meetings"][number];

/**
 * Canonical catalog query imported from @repo/shared.
 * Ensures parity between frontend and backend cache warming.
 *
 * See: packages/shared/queries.ts for query definition and documentation.
 */
export const GET_CANONICAL_CATALOG = gql(GET_CANONICAL_CATALOG_QUERY);

export type ICatalogClass = NonNullable<
  GetCanonicalCatalogQuery["catalog"]
>[number];
export type ISectionAttriuteInfo = ICatalogClass["requirementDesignation"];
export type ISectionAttribute = NonNullable<
  NonNullable<ICatalogClass["primarySection"]>["sectionAttributes"]
>[number];

export const componentMap: Record<Component, string> = {
  [Component.Cln]: "Clinic",
  [Component.Col]: "Colloquium",
  [Component.Con]: "Conversation",
  [Component.Dem]: "Demonstration",
  [Component.Dis]: "Discussion",
  [Component.Fld]: "Field Work",
  [Component.Grp]: "Directed Group Study",
  [Component.Ind]: "Independent Study",
  [Component.Int]: "Internship",
  [Component.Lab]: "Laboratory",
  [Component.Lec]: "Lecture",
  [Component.Pra]: "Practicum",
  [Component.Rea]: "Reading",
  [Component.Rec]: "Recitation",
  [Component.Sem]: "Seminar",
  [Component.Ses]: "Session",
  [Component.Slf]: "Self-paced",
  [Component.Std]: "Studio",
  [Component.Sup]: "Supplementary",
  [Component.Tut]: "Tutorial",
  [Component.Vol]: "Voluntary",
  [Component.Wbd]: "Web-Based Discussion",
  [Component.Wbl]: "Web-Based Lecture",
  [Component.Wor]: "Workshop",
};

export const academicCareersMap: Record<AcademicCareer, string> = {
  [AcademicCareer.Ugrd]: "Undergraduate",
  [AcademicCareer.Grad]: "Graduate",
  [AcademicCareer.Ucbx]: "Extension",
  [AcademicCareer.Law]: "Law",
};
