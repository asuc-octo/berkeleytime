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

export const formatSectionTime = (section: SectionFragment): string =>
  section.startTime && section.endTime
    ? `${formatTime(section.startTime)} - ${formatTime(section.endTime)}`
    : `no time`;

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
 *
 */
