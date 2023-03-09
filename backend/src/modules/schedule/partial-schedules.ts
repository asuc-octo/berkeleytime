import { ObjectID } from "bson";

export interface minimumViableSchedule {
    _id: ObjectID,
    created_by: string,
    term: string,
    name?: string,
    class_IDs?: string[],
    primary_section_IDs?: string[],
    secondary_section_IDs?: string[],
    public?: boolean,
  }

export interface partialSchedule {
    name?: string,
    created_by?: string,
    term?: string,
    class_IDs?: string[],
    primary_section_IDs?: string[],
    secondary_section_IDs?: string[],
    public?: boolean,
  }