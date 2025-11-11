import { gql } from "@apollo/client";

import { GET_CANONICAL_CATALOG_QUERY } from "@repo/shared";

import { Exam, GetCanonicalCatalogQuery, GetClassQuery, Instructor, Meeting, SectionAttribute, SectionAttributeInfo } from "../generated/graphql";

export type IInstructor = Instructor;

export type IExam = Exam;

export type ISectionAttriuteInfo = SectionAttributeInfo;

export type ISectionAttribute = SectionAttribute;

export type ISection = NonNullable<GetClassQuery["class"]>["sections"][number];

export type IMeeting = Meeting;

export type IClass = NonNullable<GetClassQuery["class"]>;

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

export type ICatalogClass = NonNullable<GetCanonicalCatalogQuery["catalog"]>[number];

/**
 * Canonical catalog query imported from @repo/shared.
 * Ensures parity between frontend and backend cache warming.
 *
 * See: packages/shared/queries.ts for query definition and documentation.
 */
export const GET_CANONICAL_CATALOG = gql(GET_CANONICAL_CATALOG_QUERY);
