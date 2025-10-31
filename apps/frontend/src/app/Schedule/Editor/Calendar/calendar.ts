import { Color } from "@repo/theme";

export interface IEvent {
  subject: string;
  number: string;
  active?: boolean;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  color?: Color;
  days?: boolean[];
  date?: string;
}

export interface IDay {
  date: moment.Moment;
  events: IEvent[];
}
