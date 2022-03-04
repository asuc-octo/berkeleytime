import cx from "classnames";
import TrashButton from "components/Common/TrashButton";
import { CourseOverviewFragment } from "graphql/graphql";
import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { courseToColor, courseToName } from "utils/courses/course";
import {
  getColorForSection,
  getCourseForSchedule,
  removeSection,
  Schedule,
  SchedulerSectionType,
} from "utils/scheduler/scheduler";
import { formatLocation, formatSectionTime } from "utils/sections/section";
import { combineStrings } from "utils/string";

import CalendarCard from "./CalendarCard";

type Props = {
  /**
   * The course associated with the section. You
   * don't need to pass this if a `schedule` is
   * provided.
   */
  course?: CourseOverviewFragment | null;
  section: SchedulerSectionType;

  /**
   * If this course card represents a section from
   * a schedule, pass the schedule here.
   */
  schedule?: Schedule;

  /**
   * Allows the user to modify the schedule from
   * this card.
   */
  setSchedule?: (newSchedule: Schedule) => void;

  /**
   * CSS hex color of the card, otherwise defaults
   * to a color determined from the course's title.
   */
  color?: string;

  /**
   * Defaults to `false`. Overrides and disables noPopover.
   * Also disables the dropdown. Use this if the card is
   * a temporary preview and not a permanent calendar item.
   */
  isPreview?: boolean;

  /**
   * If to not show a popover on this node
   */
  noPopover?: boolean;
};

const CourseCard = ({
  section,
  schedule,
  course = schedule ? getCourseForSchedule(schedule, section) : null,
  setSchedule,
  color = schedule
    ? getColorForSection(schedule, section)
    : courseToColor(section.courseId),
  isPreview = false,
  noPopover = false,
}: Props) => {
  const cardTitle = `${courseToName(course)} ${section.kind}`;
  const cardDescription = combineStrings(
    [formatLocation(section.locationName), formatSectionTime(section)],
    ", "
  );

  const card = (
    <CalendarCard
      title={cardTitle}
      description={cardDescription}
      color={color}
      className={cx("calendar-course-card", {
        "calendar-course-card--preview": isPreview,
      })}
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
            style={{ background: color }}
          />
          <h4>{cardTitle}</h4>
          {schedule && setSchedule && (
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
