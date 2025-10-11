import { gql } from "@apollo/client";

import { IClass } from "./classes";
import { Semester, SessionIdentifier } from "./terms";

export type CuratedClassIdentifier = string & {
  readonly __brand: unique symbol;
};

export interface ICuratedClass {
  __typename: "CuratedClass";
  _id: CuratedClassIdentifier;
  text: string;
  image: string;
  class: IClass;
  semester: Semester;
  year: number;
  sessionId: SessionIdentifier;
  courseNumber: string;
  number: string;
  subject: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICuratedClassInput {
  text?: string;
  image?: string;
  semester?: Semester;
  year?: number;
  sessionId?: SessionIdentifier;
  courseNumber?: string;
  number?: string;
  subject?: string;
}

export interface ReadCuratedClassResponse {
  curatedClass: ICuratedClass;
}

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

export interface CreateCuratedClassResponse {
  createCuratedClass: ICuratedClass;
}

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

export interface UpdateCuratedClassResponse {
  updateCuratedClass: ICuratedClass;
}

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

export interface DeleteCuratedClassResponse {
  deleteCuratedClass: ICuratedClass;
}

export const DELETE_CURATED_CLASS = gql`
  mutation DeleteCuratedClass($id: ID!) {
    deleteCuratedClass(id: $id)
  }
`;

export interface ReadCuratedClassesResponse {
  curatedClasses: ICuratedClass[];
}

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
