import TrashButton from 'components/Common/TrashButton';
import { CourseOverviewFragment } from 'graphql/graphql';
import React, { CSSProperties } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { courseToColor, courseToName } from 'utils/courses/course';
import {
  removeSection,
  Schedule,
  SchedulerSectionType,
} from 'utils/scheduler/scheduler';
import { formatLocation, formatSectionTime } from 'utils/sections/section';
import cx from 'classnames';
import CalendarCard from './CalendarCard';
import Color from 'color';

type Props = {
  course: CourseOverviewFragment | null;
  section: SchedulerSectionType;
  schedule: Schedule;
  setSchedule?: (newSchedule: Schedule) => void;

  /**
   * Defaults to `false`. Overrides and disables noPopover.
   * Also disables the dropdown
   */
  isPreview?: boolean;

  /**
   * If to not show a popover on this node
   */
  noPopover?: boolean;
};

const CourseCard = ({
  course,
  section,
  schedule,
  setSchedule,
  isPreview = false,
  noPopover = false,
}: Props) => {
  const cardTitle = `${courseToName(course)} ${section.kind}`;
  const cardDescription = [
    formatSectionTime(section),
    formatLocation(section.locationName),
  ]
    .filter(Boolean)
    .join(', ');

  let cardColor = courseToColor(section.courseId);
  let textColor: string | null = null;

  // If it's a preview mix the color 50% with white.
  if (isPreview) {
    const dimmedColor = Color(cardColor).lighten(0.3);
    cardColor = dimmedColor.hex();
    textColor = dimmedColor.darken(0.4).desaturate(0.8).hex();
  }

  const card = (
    <CalendarCard
      title={cardTitle}
      description={cardDescription}
      color={cardColor}
      className={cx('calendar-course-card', {
        'calendar-course-card--preview': isPreview,
      })}
      style={
        {
          '--mixed-text': textColor,
        } as CSSProperties
      }
    />
  );

  if (noPopover || isPreview) {
    return card;
  }

  const popover = (
    <Popover id={`popover-${section.id}`}>
      <div className="course-card-popover">
        <div>
          <div
            className="course-card-popover-square"
            style={{ background: cardColor }}
          />
          <h4>{cardTitle}</h4>
          {setSchedule && (
            <TrashButton
              onClick={() => {
                setSchedule(removeSection(schedule, section.id));
              }}
            />
          )}
        </div>
        <p>{cardDescription}</p>
        <p>CCN: {section.ccn}</p>
        <p>{section.instructor}</p>
      </div>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      overlay={popover}
      placement="left"
      delay={0}
      rootClose
    >
      {card}
    </OverlayTrigger>
  );
};

export default CourseCard;
