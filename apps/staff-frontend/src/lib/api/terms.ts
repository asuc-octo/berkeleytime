import { gql } from "@apollo/client";

export type Semester = "Spring" | "Summer" | "Fall" | "Winter";

export interface Term {
  year: number;
  semester: Semester;
  startDate: string;
  endDate: string;
  hasCatalogData: boolean;
}

export const READ_TERMS = gql`
  query ReadTerms {
    terms(withCatalogData: true) {
      year
      semester
      startDate
      endDate
      hasCatalogData
    }
  }
`;
