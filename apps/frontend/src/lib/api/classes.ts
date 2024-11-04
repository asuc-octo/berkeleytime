import { gql } from "@apollo/client";

import { GradeDistribution, ICourse } from ".";
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

export enum AcademicCareer {
  Undergraduate = "UGRD",
  Graduate = "GRAD",
  Extension = "UCBX",
}

export const academicCareers: Record<AcademicCareer, string> = {
  [AcademicCareer.Undergraduate]: "Undergraduate",
  [AcademicCareer.Graduate]: "Graduate",
  [AcademicCareer.Extension]: "Extension",
};

export enum FinalExam {
  Written = "Y",
  Common = "C",
  None = "N",
  Alternate = "A",
  Undecided = "D",
}

export interface IInstructor {
  familyName: string;
  givenName: string;
}

export interface IExam {
  date: string;
  location: string;
  final: boolean;
  startTime: string;
  endTime: string;
}

export interface ISection {
  // Identifiers
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  classNumber: string;
  number: string;
  ccn: string;

  // Relationships
  course: ICourse;
  class: IClass;
  term: ITerm;

  // Attributes
  enrollCount: number;
  enrollMax: number;
  component: Component;
  primary: boolean;
  waitlistCount: number;
  waitlistMax: number;
  online: boolean;
  open: boolean;
  meetings: IMeeting[];
  reservations: IReservation[];
  startDate: string;
  endDate: string;
  exams: IExam[];
  attendanceRequired: boolean;
  lecturesRecorded: boolean;
}

export interface IReservation {
  enrollCount: number;
  enrollMax: number;
  group: string;
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
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  number: string;

  // Relationships
  course: ICourse;
  primarySection: ISection;
  sections: ISection[];
  term: ITerm;
  gradeDistribution: GradeDistribution;

  // Attributes
  session: string;
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
    $subject: String!
    $courseNumber: String!
    $number: String!
  ) {
    class(
      year: $year
      semester: $semester
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
          count
        }
      }
      course {
        title
        description
        classes {
          year
          semester
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
        }
        gradeDistribution {
          average
          distribution {
            letter
            count
          }
        }
        academicCareer
        requirements
      }
      primarySection {
        number
        ccn
        enrollCount
        enrollMax
        reservations {
          enrollCount
          enrollMax
          group
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
          final
          location
          startTime
          endTime
        }
        component
        waitlistCount
        waitlistMax
        startDate
        endDate
      }
      sections {
        number
        ccn
        enrollCount
        enrollMax
        exams {
          date
          final
          location
          startTime
          endTime
        }
        meetings {
          days
          endTime
          startTime
          location
          instructors {
            familyName
            givenName
          }
        }
        component
        waitlistCount
        waitlistMax
        startDate
        endDate
      }
    }
  }
`;

export interface GetClassesResponse {
  catalog: ICourse[];
}

export const GET_CLASSES = gql`
  query GetClasses($year: Int!, $semester: Semester!) {
    catalog(year: $year, semester: $semester) {
      subject
      number
      title
      gradeDistribution {
        average
      }
      academicCareer
      classes {
        subject
        courseNumber
        number
        title
        unitsMax
        unitsMin
        finalExam
        gradingBasis
        primarySection {
          component
          online
          open
          enrollCount
          enrollMax
          waitlistCount
          waitlistMax
          meetings {
            days
          }
        }
      }
    }
  }
`;
