import { SectionFragment } from 'graphql/graphql';
import groupBy from 'lodash/groupBy';
import { stringToDate } from 'utils/date';
import { isEnrollmentSection } from './section';

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
export function sectionSortComparator(
  s1: SectionFragment,
  s2: SectionFragment
): number {
  const typeA = s1.kind
    ? SECTION_TYPE_ORDER[s1.kind] || s1.kind[0].charCodeAt(0)
    : Infinity;

  const typeB = s2.kind
    ? SECTION_TYPE_ORDER[s2.kind] || s2.kind[0].charCodeAt(0)
    : Infinity;

  if (typeA !== typeB) {
    return typeA - typeB;
  }

  const e1 = +isEnrollmentSection(s1);
  const e2 = +isEnrollmentSection(s2);

  if (e1 !== e2) {
    return (e1 * 2 - 1) * -Infinity;
  }

  const t1 = +s1.days[0] || Infinity;
  const t2 = +s2.days[0] || Infinity;

  if (t1 !== t2) {
    return t1 - t2;
  }

  const d1 = +stringToDate(s1.startTime);
  const d2 = +stringToDate(s2.startTime);

  if (d1 !== d2) {
    return d1 - d2;
  }

  const n1 = s1.sectionNumber;
  const n2 = s2.sectionNumber;

  return n1.localeCompare(n2);
}

/**
 * Sorts sections
 */
export function sortSections(sections: SectionFragment[]): SectionFragment[] {
  return sections.sort(sectionSortComparator);
}

/**
 * Sorts a list of sections into ([type, [sections]])
 */
export function groupSections(sections: SectionFragment[]) {
  return Object.entries(groupBy(sections, (s) => s.kind))
    .sort(
      (a, b) =>
        (SECTION_TYPE_ORDER[a[0]] ?? Infinity) - SECTION_TYPE_ORDER[b[0]]
    )
    .map(([category, sections]: [string, SectionFragment[]]) => ({
      category,
      sections: sections.sort(sectionSortComparator),
    }));
}
