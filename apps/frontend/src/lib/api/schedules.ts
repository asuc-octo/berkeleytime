import { gql } from "@apollo/client";

import { IClass, ISection } from "../api";
import { ITerm, Semester } from "./terms";

export type ScheduleIdentifier = string & {
  readonly __brand: unique symbol;
};

export interface IScheduleClass {
  class: IClass;
  selectedSections: ISection[];
}

export interface IScheduleClassInput {
  subject: string;
  courseNumber: string;
  number: string;
  sectionIds: string[];
}

export interface IScheduleEvent {
  startTime: string;
  _id: string;
  endTime: string;
  title: string;
  location?: string;
  description?: string;
  days: boolean[];
  __typename: string;
}

export interface IScheduleInput {
  name: string;
  year: number;
  semester: Semester;
  sessionId: string;
  classes?: IScheduleClassInput[];
  events?: IScheduleEvent[];
  public?: boolean;
}

export interface ISchedule {
  __typename: "Schedule";
  _id: ScheduleIdentifier;
  public: boolean;
  name: string;
  classes: IScheduleClass[];
  events: IScheduleEvent[];
  createdBy: string;
  term: ITerm;
  year: number;
  semester: Semester;
  sessionId: string;
}

export interface ReadScheduleResponse {
  schedule: ISchedule;
}

export const READ_SCHEDULE = gql`
  query ReadSchedule($id: ID!) {
    schedule(id: $id) {
      _id
      name
      public
      createdBy
      year
      semester
      sessionId
      term {
        startDate
        endDate
      }
      events {
        _id
        title
        description
        startTime
        endTime
        days
      }
      classes {
        class {
          subject
          courseNumber
          number
          unitsMax
          unitsMin
          course {
            title
          }
          primarySection {
            sectionId
            subject
            courseNumber
            classNumber
            number
            startDate
            endDate
            component
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
          sections {
            sectionId
            subject
            courseNumber
            classNumber
            number
            startDate
            endDate
            component
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
        selectedSections {
          sectionId
        }
      }
    }
  }
`;

export interface UpdateScheduleResponse {
  updateSchedule: ISchedule;
}

export const UPDATE_SCHEDULE = gql`
  mutation UpdateSchedule($id: ID!, $schedule: UpdateScheduleInput!) {
    updateSchedule(id: $id, schedule: $schedule) {
      _id
      name
      public
      createdBy
      year
      semester
      term {
        startDate
        endDate
      }
      events {
        _id
        title
        description
        startTime
        endTime
        days
      }
      classes {
        class {
          subject
          courseNumber
          number
          unitsMax
          unitsMin
          course {
            title
          }
          primarySection {
            sectionId
            subject
            courseNumber
            classNumber
            number
            startDate
            endDate
            component
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
          sections {
            sectionId
            subject
            courseNumber
            classNumber
            number
            startDate
            endDate
            component
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
        selectedSections {
          sectionId
        }
      }
    }
  }
`;

export interface DeleteScheduleResponse {
  deleteSchedule: ScheduleIdentifier;
}

export const DELETE_SCHEDULE = gql`
  mutation DeleteSchedule($id: ID!) {
    deleteSchedule(id: $id)
  }
`;

export interface CreateScheduleResponse {
  createSchedule: ISchedule;
}

export const CREATE_SCHEDULE = gql`
  mutation CreateSchedule($schedule: CreateScheduleInput!) {
    createSchedule(schedule: $schedule) {
      _id
      name
      public
      year
      createdBy
      semester
      events {
        _id
        title
        description
        startTime
        endTime
        days
      }
      sessionId
      classes {
        class {
          subject
          courseNumber
          number
        }
        # selectedSections
      }
    }
  }
`;

export interface ReadSchedulesResponse {
  schedules: ISchedule[];
}

export const READ_SCHEDULES = gql`
  query ReadSchedules {
    schedules {
      _id
      name
      year
      semester
      sessionId
      classes {
        class {
          subject
          courseNumber
          number
        }
        # selectedSections
      }
    }
  }
`;
