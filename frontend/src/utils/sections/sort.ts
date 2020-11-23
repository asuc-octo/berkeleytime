import { SectionFragment } from 'graphql/graphql';
import groupBy from 'lodash/groupBy';

export type SectionSort = {
  category: string;
  sections: SectionFragment[];
}[];

const SECTION_TYPE_ORDER: { [key: string]: number } = {
  Lecture: 0.1,
  Discussion: 0.2,
};

/**
 * Sorts a list of sections into ([type, [sections]])
 */
export function sortSections(sections: SectionFragment[]) {
  return Object.entries(groupBy(sections, s => s.kind))
    .sort((a, b) => SECTION_TYPE_ORDER[a[0]] - SECTION_TYPE_ORDER[b[0]])
    .map(([category, sections]) => ({
      category,
      sections,
    }));
}
