import { TermOutput } from "../../generated-types/graphql";

export interface minimumViableSchedule {
    created_by: string,
    term: TermOutput,
    name?: string,
    class_IDs?: string[],
    primary_section_IDs?: string[],
    secondary_section_IDs?: string[],
    is_public?: boolean,
  }

export interface partialSchedule {
    name?: string,
    created_by?: string,
    term?: TermOutput,
    class_IDs?: string[],
    primary_section_IDs?: string[],
    secondary_section_IDs?: string[],
    is_public?: boolean,
  }
