import { SectionFragment } from 'graphql/graphql';
import { ReactNode } from 'react';
import { formatTime } from 'utils/date';
import { applyIndicatorPercent } from 'utils/utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SectionType =
  | 'Clinic'
  | 'Colloquium'
  | 'Conversation'
  | 'Demonstration'
  | 'Directed Group Study'
  | 'Discussion'
  | 'Field Work'
  | 'Independent Study'
  | 'Internship'
  | 'Laboratory'
  | 'Lecture'
  | 'Listening'
  | 'Practicum'
  | 'Reading'
  | 'Recitation'
  | 'Research'
  | 'Self-paced'
  | 'Seminar'
  | 'Session'
  | 'Simulcast'
  | 'Studio'
  | 'Supplementary'
  | 'Tutorial'
  | 'Voluntary'
  | 'Web-Based Discussion'
  | 'Web-Based Lecture'
  | 'Workshop';

export const formatLocation = (location: string): string => {
  if (location === 'Internet/Online') {
    return 'Online';
  } else {
    return location;
  }
};

/**
 * Formats a section time.
 *
 * @example
 * formatSecctionTime(someSection)
 * // "3:00pm - 4:30pm"
 *
 * @example
 * formatSecctionTime(someSectionWithNoTime, false)
 * // ""
 */
export const formatSectionTime = (
  section: SectionFragment,
  showNoTime: boolean = true
): string =>
  section.startTime && section.endTime
    ? `${formatTime(section.startTime)} \u{2013} ${formatTime(section.endTime)}`
    : showNoTime
    ? `no time`
    : '';

export const formatSectionEnrollment = (section: SectionFragment): ReactNode =>
  section.enrolled !== null &&
  section.enrolledMax !== null &&
  section.enrolled !== undefined &&
  section.enrolledMax !== undefined
    ? applyIndicatorPercent(
        `${section.enrolled}/${section.enrolledMax} enrolled`,
        section.enrolled / section.enrolledMax
      )
    : 'Enrollment N/A';

/**
 * Checks if the section is the 'enrollment' section.
 * For CS classes this means its a 999 section.
 *
 * @example
 * isEnrollmentSection({ sectionNumber: '999', ... })
 * // true
 */
export const isEnrollmentSection = (section: SectionFragment): boolean =>
  /^999[A-Z]?$/.test(section.sectionNumber);
