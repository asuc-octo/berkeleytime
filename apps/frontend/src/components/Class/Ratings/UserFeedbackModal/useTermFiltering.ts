import { useEffect, useMemo, useRef } from "react";

import _ from "lodash";

import { sortByTermDescending } from "@/lib/classes";
import { Semester, TemporalPosition } from "@/lib/generated/graphql";

import { formatInstructorText } from "../metricsUtil";

interface Term {
  value: string;
  label: string;
  semester: Semester;
  year: number;
  classNumber?: string;
}

interface TermsData {
  semester: string;
  year: number;
  temporalPosition: TemporalPosition;
}

interface UseTermFilteringOptions {
  availableTerms?: Term[];
  termsData?: TermsData[];
  // For course-specific filtering (e.g., in RatingGrowthModal)
  selectedCourse?: { subject: string; number: string } | null;
  courseData?: {
    classes?: Array<{
      semester: string;
      year: number;
      number: string;
      anyPrintInScheduleOfClasses?: boolean | null;
      primarySection?: {
        startDate?: string;
        meetings?: Array<{
          instructors?: Array<{
            givenName?: string | null;
            familyName?: string | null;
          }>;
        }>;
      } | null;
    }>;
  };
}

export function useTermFiltering({
  availableTerms = [],
  termsData,
  selectedCourse,
  courseData,
}: UseTermFilteringOptions) {
  const hasAutoSelected = useRef(false);

  const normalizeTerm = (term: Term): Term => {
    if (term.classNumber) return term;
    const parts = term.value.trim().split(" ");
    const last = parts[parts.length - 1] ?? "";
    return {
      ...term,
      classNumber: last || undefined,
    };
  };

  // Filter for past terms
  const pastTerms = useMemo(() => {
    if (!termsData) return availableTerms;

    const termPositions = termsData.reduce(
      (acc: Record<string, TemporalPosition>, term: TermsData) => {
        acc[`${term.semester} ${term.year}`] = term.temporalPosition;
        return acc;
      },
      {}
    );
    return availableTerms
      .filter((term) => {
        const key = `${term.semester} ${term.year}`;
        const position = termPositions[key];

        if (!position) return true;

        return (
          position === TemporalPosition.Past ||
          position === TemporalPosition.Current
        );
      })
      .map(normalizeTerm);
  }, [availableTerms, termsData]);

  // Filter for course-specific terms (when a course is selected)
  const filteredSemesters = useMemo(() => {
    if (!selectedCourse || !courseData) return pastTerms;

    const courseTerms: Term[] = [...(courseData.classes ?? [])]
      .sort(sortByTermDescending)
      .filter((c) => c.anyPrintInScheduleOfClasses !== false)
      .filter((c) => {
        if (c.primarySection?.startDate) {
          const startDate = new Date(c.primarySection.startDate);
          const today = new Date();
          return startDate <= today;
        }
        return true;
      })
      .map((c) => {
        // Format instructor text - formatInstructorText handles null/undefined cases
        const instructorText = formatInstructorText(c.primarySection);
        return {
          value: `${c.semester} ${c.year} ${c.number}`,
          label: `${c.semester} ${c.year} ${instructorText}`,
          semester: c.semester as Semester,
          year: c.year,
          classNumber: c.number,
        } satisfies Term;
      })
      .map(normalizeTerm);

    return _.uniqBy(courseTerms, (term) => term.label);
  }, [selectedCourse, courseData, pastTerms]);

  // Reset auto-selection flag when course changes
  useEffect(() => {
    if (selectedCourse !== undefined) {
      hasAutoSelected.current = false;
    }
  }, [selectedCourse]);

  return {
    filteredSemesters,
    pastTerms,
    hasAutoSelected,
  };
}
