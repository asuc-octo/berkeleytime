export interface IEvent {
  subject: string;
  number: string;
  active?: boolean;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  days?: boolean[];
  date?: string;
}

export interface IDay {
  date: moment.Moment;
  events: IEvent[];
}
