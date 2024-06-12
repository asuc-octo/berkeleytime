import { gql } from "@apollo/client";

export enum Semester {
  Fall = "Fall",
  Spring = "Spring",
  Summer = "Summer",
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

export const components: Record<Component, string> = {
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
  ccn: string;
  class: IClass;
  course: ICourse;
  enrollCount: number;
  enrollMax: number;
  component: Component;
  number: string;
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
  course: ICourse;
  primarySection: ISection;
  sections: ISection[];
  session: string;
  gradingBasis: string;
  finalExam: string;
  description: string | null;
  year: number;
  semester: Semester;
  title: string | null;
  unitsMax: number;
  unitsMin: number;
  number: string;
}

export interface ICourse {
  classes: IClass[];
  crossListing: ICourse[];
  sections: ISection[];
  requiredCourses: ICourse[];
  requirements: string | null;
  description: string;
  fromDate: string;
  gradeAverage: number | null;
  gradingBasis: string;
  finalExam: string;
  academicCareer: AcademicCareer;
  title: string;
  subject: string;
  number: string;
  toDate: string;
}

export interface IAccount {
  email: string;
}

export const GET_COURSE = gql`
  query GetCourse($subject: String!, $courseNumber: String!) {
    course(subject: $subject, courseNumber: $courseNumber) {
      title
      classes {
        year
        semester
        number
        unitsMax
        unitsMin
      }
      academicCareer
      description
      gradeAverage
      gradingBasis
      subject
      requirements
      requiredCourses {
        subject
        number
      }
      number
    }
  }
`;

export const GET_CLASS = gql`
  query GetClass(
    $term: TermInput!
    $subject: String!
    $courseNumber: String!
    $classNumber: String!
  ) {
    class(
      term: $term
      subject: $subject
      courseNumber: $courseNumber
      classNumber: $classNumber
    ) {
      title
      description
      unitsMax
      unitsMin
      number
      course {
        title
        description
        gradeAverage
        gradingBasis
        subject
        academicCareer
        requirements
        requiredCourses {
          subject
          number
        }
        number
        classes {
          year
          semester
          number
        }
      }
      primarySection {
        course {
          subject
          number
        }
        reservations {
          enrollCount
          enrollMax
          group
        }
        ccn
        enrollCount
        enrollMax
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
        primary
        waitlistCount
        waitlistMax
        number
        startDate
        endDate
      }
      sections {
        course {
          subject
          number
        }
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
        primary
        component
        waitlistCount
        waitlistMax
        number
        startDate
        endDate
      }
    }
  }
`;

export const GET_COURSES = gql`
  query GetCourses($term: TermInput!) {
    catalog(term: $term) {
      subject
      number
      title
      gradeAverage
      academicCareer
      classes {
        number
        title
        unitsMax
        gradingBasis
        finalExam
        session
        unitsMin
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

export const GET_ACCOUNT = gql`
  query GetAccount {
    user {
      email
    }
  }
`;
