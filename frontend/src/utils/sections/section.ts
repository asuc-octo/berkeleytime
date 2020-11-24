import { SectionFragment } from 'graphql/graphql';
import { formatTime } from 'utils/date';

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
