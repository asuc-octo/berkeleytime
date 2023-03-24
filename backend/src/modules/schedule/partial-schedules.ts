import { OutputTerm } from "../../generated-types/graphql";

export interface minimumViableSchedule {
    created_by: string,
    term: OutputTerm,
    name?: string,
    class_IDs?: string[],
    primary_section_IDs?: string[],
    secondary_section_IDs?: string[],
    is_public?: boolean,
  }

export interface partialSchedule {
    name?: string,
    created_by?: string,
    term?: OutputTerm,
    class_IDs?: string[],
    primary_section_IDs?: string[],
    secondary_section_IDs?: string[],
    is_public?: boolean,
  }
