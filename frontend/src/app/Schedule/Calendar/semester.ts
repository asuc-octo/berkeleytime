import { ISection } from "@/lib/api";

interface IEvent extends ISection {
  active?: boolean;
}

export interface IDay {
  date: moment.Moment;
  events: IEvent[];
}
