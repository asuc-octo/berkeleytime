import { gql } from "@apollo/client";

export enum Semester {
  Fall = "Fall",
  Spring = "Spring",
  Summer = "Summer",
  Winter = "Winter",
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
  primaryComponent: Component;
  description: string;
  fromDate: string;
  gradeAverage: number | null;
  gradingBasis: string;
  finalExam: string | null;
  academicCareer: AcademicCareer;
  title: string;
  subject: string;
  number: string;
  toDate: string;
}

export interface IAccount {
  email: string;
  first_name: string;
  last_name: string;
}

export interface ISchedule {
  _id: string;
  name: string;
  term: {
    year: number;
    semester: Semester;
  };
}

export const GET_COURSE = gql`
  query GetCourse($subject: String!, $courseNumber: String!) {
    course(subject: $subject, courseNumber: $courseNumber) {
      title
      description
      subject
      number
      academicCareer
      gradeAverage
      gradingBasis
      finalExam
      requirements
      requiredCourses {
        subject
        number
      }
      classes {
        year
        semester
        number
      }
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
      gradingBasis
      finalExam
      course {
        title
        description
        gradeAverage
        subject
        number
        academicCareer
        requirements
        requiredCourses {
          subject
          number
        }
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

export interface GetCoursesResponse {
  courseList: ICourse[];
}

export const GET_COURSES = gql`
  query GetCourses {
    courseList {
      subject
      number
      title
      gradeAverage
      academicCareer
      finalExam
      gradingBasis
      classes {
        year
        semester
      }
    }
  }
`;

export interface GetClassesResponse {
  catalog: ICourse[];
}

export const GET_CLASSES = gql`
  query GetClasses($term: TermInput!) {
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
        session
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

export interface AccountResponse {
  user: IAccount;
}

export const GET_ACCOUNT = gql`
  query GetAccount {
    user {
      email
      first_name
      last_name
    }
  }
`;

export interface GetScheduleResponse {
  scheduleByID: ISchedule;
}

export const GET_SCHEDULE = gql`
  query GetSchedule($id: String!) {
    scheduleByID(id: $id) {
      _id
      name
      term {
        year
        semester
      }
    }
  }
`;

export const DELETE_SCHEDULE = gql`
  mutation DeleteSchedule($id: ID!) {
    removeScheduleByID(id: $id)
  }
`;

export interface CreateScheduleResponse {
  createNewSchedule: ISchedule;
}

export const CREATE_SCHEDULE = gql`
  mutation CreateSchedule(
    $name: String!
    $term: TermInput!
    $createdBy: String!
  ) {
    createNewSchedule(
      main_schedule: {
        courses: []
        created_by: $createdBy
        name: $name
        custom_events: []
        is_public: false
        term: $term
      }
    ) {
      _id
      name
      term {
        year
        semester
      }
    }
  }
`;

export interface GetSchedulesResponse {
  schedulesByUser: ISchedule[];
}

export const GET_SCHEDULES = gql`
  query GetSchedules($createdBy: String!) {
    schedulesByUser(created_by: $createdBy) {
      _id
      name
      term {
        year
        semester
      }
    }
  }
`;

export const signIn = (redirectURI?: string) => {
  redirectURI =
    redirectURI ?? window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/login?redirect_uri=${redirectURI}`;
};

export const signOut = async (redirectURI?: string) => {
  redirectURI =
    redirectURI ?? window.location.pathname + window.location.search;

  window.location.href = `${window.location.origin}/api/logout?redirect_uri=${redirectURI}`;
};
