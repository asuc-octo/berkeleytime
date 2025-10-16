import { gql } from "@apollo/client";

import { GradeDistribution, ICourse, IEnrollment } from ".";
import { IAggregatedRatings } from "./ratings";
import { ITerm, Semester } from "./terms";

export enum InstructionMethod {
  Unknown = "UNK",
  DirectedGroupStudy = "GRP",
  Workshop = "WOR",
  WebBasedDiscussion = "WBD",
  Tutorial = "TUT",
  Seminar = "SEM",
  FieldWork = "FLD",
  Recitation = "REC",
  IndependentStudy = "IND",
  Session = "SES",
  Colloquium = "COL",
  Clinic = "CLC",
  Studio = "STD",
  Lecture = "LEC",
  Reading = "REA",
  Internship = "INT",
  Discussion = "DIS",
  Demonstration = "DEM",
  Conversation = "CON",
  SelfPaced = "SLF",
  WebBasedLecture = "WBL",
  Laboratory = "LAB",
}

export enum Component {
  Workshop = "WOR",
  WebBasedDiscussion = "WBD",
  Clinic = "CLN",
  Practicum = "PRA",
  DirectedGroupStudy = "GRP",
  Discussion = "DIS",
  Voluntary = "VOL",
  Tutorial = "TUT",
  FieldWork = "FLD",
  Lecture = "LEC",
  Supplementary = "SUP",
  Laboratory = "LAB",
  Session = "SES",
  Studio = "STD",
  SelfPaced = "SLF",
  Colloquium = "COL",
  WebBasedLecture = "WBL",
  IndependentStudy = "IND",
  Internship = "INT",
  Reading = "REA",
  Recitation = "REC",
  Seminar = "SEM",
}

export const instructionMethodMap: Record<InstructionMethod, string> = {
  [InstructionMethod.Lecture]: "Lecture",
  [InstructionMethod.Seminar]: "Seminar",
  [InstructionMethod.IndependentStudy]: "Independent Study",
  [InstructionMethod.DirectedGroupStudy]: "Directed Group Study",
  [InstructionMethod.Studio]: "Studio",
  [InstructionMethod.Laboratory]: "Laboratory",
  [InstructionMethod.Workshop]: "Workshop",
  [InstructionMethod.WebBasedDiscussion]: "Web-Based Discussion",
  [InstructionMethod.Clinic]: "Clinic",
  [InstructionMethod.Discussion]: "Discussion",
  [InstructionMethod.Tutorial]: "Tutorial",
  [InstructionMethod.FieldWork]: "Field Work",
  [InstructionMethod.Session]: "Session",
  [InstructionMethod.SelfPaced]: "Self-paced",
  [InstructionMethod.Colloquium]: "Colloquium",
  [InstructionMethod.WebBasedLecture]: "Web-Based Lecture",
  [InstructionMethod.Internship]: "Internship",
  [InstructionMethod.Reading]: "Reading",
  [InstructionMethod.Recitation]: "Recitation",
  [InstructionMethod.Unknown]: "Unknown",
  [InstructionMethod.Demonstration]: "Demonstration",
  [InstructionMethod.Conversation]: "Conversation",
};

export const componentMap: Record<Component, string> = {
  [Component.Lecture]: "Lecture",
  [Component.Seminar]: "Seminar",
  [Component.IndependentStudy]: "Independent Study",
  [Component.DirectedGroupStudy]: "Directed Group Study",
  [Component.Studio]: "Studio",
  [Component.Laboratory]: "Laboratory",
  [Component.Workshop]: "Workshop",
  [Component.WebBasedDiscussion]: "Web-Based Discussion",
  [Component.Clinic]: "Clinic",
  [Component.Practicum]: "Practicum",
  [Component.Discussion]: "Discussion",
  [Component.Voluntary]: "Voluntary",
  [Component.Tutorial]: "Tutorial",
  [Component.FieldWork]: "Field Work",
  [Component.Supplementary]: "Supplementary",
  [Component.Session]: "Session",
  [Component.SelfPaced]: "Self-paced",
  [Component.Colloquium]: "Colloquium",
  [Component.WebBasedLecture]: "Web-Based Lecture",
  [Component.Internship]: "Internship",
  [Component.Reading]: "Reading",
  [Component.Recitation]: "Recitation",
};

export enum FinalExam {
  Written = "Y",
  Common = "C",
  None = "N",
  Alternate = "A",
  Undecided = "D",
}

export enum ExamType {
  Final = "FIN",
  Midterm = "MID",
  Alternate = "ALT",
  MakeUp = "MAK",
}

export interface IInstructor {
  familyName: string;
  givenName: string;
}

export interface IExam {
  date: string;
  location?: string;
  type: ExamType;
  startTime: string;
  endTime: string;
}

export interface ISection {
  enrollment: IEnrollment;
  // Identifiers
  termId: string;
  sessionId: string;
  sectionId: string;

  // Relationships (what is relationships?)
  term: ITerm;
  course: ICourse;
  class: IClass;

  // Attributes
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
  number: string;
  startDate: string;
  endDate: string;
  primary: boolean;
  instructionMode: string;
  component: Component;
  meetings: IMeeting[];
  exams: IExam[];
  online: boolean;
  attendanceRequired: boolean;
  lecturesRecorded: boolean;
  sectionAttributes: {
    attribute: {
      code: string;
      description: string;
      formalDescription: string;
    };
    value: {
      code: string;
      description: string;
      formalDescription: string;
    };
  }[];
}

export interface IMeeting {
  days: boolean[];
  endTime: string;
  location: string;
  startTime: string;
  instructors: IInstructor[];
}

export interface IClass {
  // Identifiers
  termId: string;
  sessionId: string;
  courseId: string;
  subject: string;
  courseNumber: string;
  number: string;

  // Relationships
  term: ITerm;
  course: ICourse;
  primarySection: ISection;
  sections: ISection[];
  gradeDistribution: GradeDistribution;
  aggregatedRatings: IAggregatedRatings;

  // Attributes
  year: number;
  semester: Semester;
  gradingBasis: string;
  finalExam: string;
  description: string | null;
  title: string | null;
  unitsMax: number;
  unitsMin: number;
}

export interface ReadClassResponse {
  class: IClass;
}

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
        distribution {
          letter
          percentage
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
          distribution {
            letter
            percentage
            count
          }
        }
        academicCareer
        requirements
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
            status
            enrolledCount
            maxEnroll
            waitlistedCount
            maxWaitlist
            seatReservationCounts {
              enrolledCount
              maxEnroll
              number
            }
          }
          history {
            status
            enrolledCount
            maxEnroll
            waitlistedCount
            maxWaitlist
            seatReservationCounts {
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

export interface GetCatalogResponse {
  catalog: IClass[];
}

export const GET_CATALOG = gql`
  query GetCatalog($year: Int!, $semester: Semester!) {
    catalog(year: $year, semester: $semester) {
      number
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
        sectionAttributes {
          attribute {
            code
            description
            formalDescription
          }
          value {
            code
            description
            formalDescription
          }
        }
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
          distribution {
            letter
            percentage
            count
          }
        }
        academicCareer
      }
    }
  }
`;
