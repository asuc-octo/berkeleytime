import { gql } from "@apollo/client";

import { IClass } from "../api";
import { Semester } from "./term";

export interface ISelectedClass {
  class: IClass;
  selectedSections: string[];
}

export interface ICustomEvent {
  startTime: string;
  endTime: string;
  title: string;
  location?: string;
  description?: string;
  days: boolean[];
}

export interface ISchedule {
  _id: string;
  name: string;
  classes: ISelectedClass[];
  events: ICustomEvent[];
  createdBy: string;
  term: {
    year: number;
    semester: Semester;
  };
}

export interface GetScheduleResponse {
  schedule: ISchedule;
}

export const GET_SCHEDULE = gql`
  query GetSchedule($id: String!) {
    schedule(id: $id) {
      _id
      name
      classes {
        class {
          title
        }
        selectedSections
      }
      term {
        year
        semester
      }
    }
  }
`;

export interface DeleteScheduleResponse {
  deleteSchedule: string;
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
      term {
        year
        semester
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
      classes {
        class {
          title
        }
        selectedSections
      }
      term {
        year
        semester
      }
    }
  }
`;
