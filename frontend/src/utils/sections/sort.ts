import { SectionFragment } from 'graphql/graphql';
import groupBy from 'lodash/groupBy';
import { stringToTime } from 'utils/date';

export type SectionSort = {
  category: string;
  sections: SectionFragment[];
}[];

// Specify an ordering for section types.
const SECTION_TYPE_ORDER: { [key: string]: number } = {
  Lecture: 0.1,
  Discussion: 0.2,
  Laboratory: 0.3,
};

/**
 * Section time sort comparatorr
 */
export function sectionSortCopmarator(s1: SectionFragment, s2: SectionFragment): number {
  const t1 = +stringToTime(s1.startTime)
  const t2 = +stringToTime(s2.startTime);
  if (t1 === t2) {
    return +s1.days[0] - +s2.days[0];
  } else {
    return t1 - t2;
  }
}

/**
 * Sorts a list of sections into ([type, [sections]])
 */
export function sortSections(sections: SectionFragment[]) {
  return Object.entries(groupBy(sections, (s) => s.kind))
    .sort((a, b) => (SECTION_TYPE_ORDER[a[0]] ?? Infinity) - SECTION_TYPE_ORDER[b[0]])
    .map(([category, sections]) => ({
      category,
      sections: sections.sort(sectionSortCopmarator),
    }));
}
