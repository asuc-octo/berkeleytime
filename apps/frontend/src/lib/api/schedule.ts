import { gql } from "@apollo/client";

import { IClass } from "../api";
import { ITerm, Semester } from "./term";

export type ScheduleIdentifier = string & {
  readonly __brand: unique symbol;
};

export interface IScheduleClass {
  class: IClass;
  selectedSections: string[];
}

export interface IScheduleClassInput {
  subject: string;
  courseNumber: string;
  number: string;
  sections: string[];
}

export interface IScheduleEvent {
  startTime: string;
  endTime: string;
  title: string;
  location?: string;
  description?: string;
  days: boolean[];
}

export interface IScheduleInput {
  name: string;
  year: number;
  semester: Semester;
  classes?: IScheduleClassInput[];
  events?: IScheduleEvent[];
  public?: boolean;
}

export interface ISchedule {
  _id: ScheduleIdentifier;
  name: string;
  classes: IScheduleClass[];
  events: IScheduleEvent[];
  createdBy: string;
  term: ITerm;
  year: number;
  semester: Semester;
}

export interface GetScheduleResponse {
  schedule: ISchedule;
}

export const GET_SCHEDULE = gql`
  query GetSchedule($id: ID!) {
    schedule(id: $id) {
      _id
      name
      public
      createdBy
      year
      semester
      classes {
        class {
          subject
          courseNumber
          number
        }
        selectedSections
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
      year
      createdBy
      semester
      classes {
        class {
          subject
          courseNumber
          number
        }
        selectedSections
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
      classes {
        class {
          subject
          courseNumber
          number
        }
        selectedSections
      }
    }
  }
`;

export interface GetSchedulesResponse {
  schedules: ISchedule[];
}

export const GET_SCHEDULES = gql`
  query GetSchedules {
    schedules {
      _id
      name
      year
      semester
      classes {
        class {
          subject
          courseNumber
          number
        }
        selectedSections
      }
    }
  }
`;
