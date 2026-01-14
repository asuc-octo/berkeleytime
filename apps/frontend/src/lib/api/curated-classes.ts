import { gql } from "@apollo/client";

import { GetCuratedClassesQuery } from "../generated/graphql";

export const READ_CURATED_CLASS = gql`
  query GetCuratedClass($id: ID!) {
    curatedClass(id: $id) {
      _id
      text
      image
      subject
      courseNumber
      number
      semester
      year
      sessionId
      publishedAt
      createdAt
      updatedAt
      class {
        number
        sessionId
        title
        unitsMax
        unitsMin
        finalExam
        gradingBasis
        primarySection {
          component
          online
          instructionMode
          attendanceRequired
          lecturesRecorded
          enrollment {
            latest {
              status
              enrolledCount
              maxEnroll
              waitlistedCount
              maxWaitlist
            }
          }
          meetings {
            days
          }
        }
        course {
          subject
          number
          title
          gradeDistribution {
            average
          }
          academicCareer
        }
      }
    }
  }
`;

export const CREATE_CURATED_CLASS = gql`
  mutation CreateCuratedClass($curatedClass: CreateCuratedClassInput!) {
    createCuratedClass(curatedClass: $curatedClass) {
      _id
      text
      image
      subject
      courseNumber
      number
      semester
      year
      sessionId
      publishedAt
      createdAt
      updatedAt
      class {
        number
        sessionId
        title
        unitsMax
        unitsMin
        finalExam
        gradingBasis
        primarySection {
          component
          online
          instructionMode
          attendanceRequired
          lecturesRecorded
          enrollment {
            latest {
              status
              enrolledCount
              maxEnroll
              waitlistedCount
              maxWaitlist
            }
          }
          meetings {
            days
          }
        }
        course {
          subject
          number
          title
          gradeDistribution {
            average
          }
          academicCareer
        }
      }
    }
  }
`;

export const UPDATE_CURATED_CLASS = gql`
  mutation UpdateCuratedClass(
    $id: ID!
    $curatedClass: UpdateCuratedClassInput!
  ) {
    updateCuratedClass(id: $id, curatedClass: $curatedClass) {
      _id
      text
      image
      subject
      courseNumber
      number
      semester
      year
      sessionId
      publishedAt
      createdAt
      updatedAt
      class {
        number
        sessionId
        title
        unitsMax
        unitsMin
        finalExam
        gradingBasis
        primarySection {
          component
          online
          instructionMode
          attendanceRequired
          lecturesRecorded
          enrollment {
            latest {
              status
              enrolledCount
              maxEnroll
              waitlistedCount
              maxWaitlist
            }
          }
          meetings {
            days
          }
        }
        course {
          subject
          number
          title
          gradeDistribution {
            average
          }
          academicCareer
        }
      }
    }
  }
`;

export const DELETE_CURATED_CLASS = gql`
  mutation DeleteCuratedClass($id: ID!) {
    deleteCuratedClass(id: $id)
  }
`;

export const READ_CURATED_CLASSES = gql`
  query GetCuratedClasses {
    curatedClasses {
      _id
      text
      image
      subject
      courseNumber
      number
      semester
      year
      sessionId
      publishedAt
      createdAt
      updatedAt
      class {
        number
        sessionId
        title
        unitsMax
        unitsMin
        finalExam
        gradingBasis
        primarySection {
          component
          online
          instructionMode
          attendanceRequired
          lecturesRecorded
          enrollment {
            latest {
              status
              enrolledCount
              maxEnroll
              waitlistedCount
              maxWaitlist
              activeReservedMaxCount
              endTime
            }
          }
          meetings {
            days
          }
        }
        course {
          subject
          number
          title
          gradeDistribution {
            average
          }
          academicCareer
          ratingsCount
        }
      }
    }
  }
`;

export type ICuratedClass = NonNullable<
  GetCuratedClassesQuery["curatedClasses"]
>[number];
