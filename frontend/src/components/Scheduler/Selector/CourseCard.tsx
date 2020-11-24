import {
  CourseFragment,
  SectionFragment,
} from 'graphql/graphql';
import React, { ChangeEvent, CSSProperties, ReactNode } from 'react';
import { Form } from 'react-bootstrap';

import { formatTime } from 'utils/date';
import { hasSectionById, Schedule } from 'utils/scheduler/scheduler';
import { formatLocation, formatSectionTime } from 'utils/sections/section';
import { groupSections } from 'utils/sections/sort';
import {
  applyIndicatorPercent,
  formatUnits,
  getIndicatorPercent,
} from 'utils/utils';
import { useScheduleContext } from '../ScheduleContext';

const MAX_SECTIONS_BEFORE_SCROLL: number = 8;
const SCROLL_SECTION_HEIGHT: string = '280px';

type SectionProps = {
  course: CourseFragment;
  sections: SectionFragment[];
  isFirst?: boolean;
};

const CourseCardSection = ({
  course,
  sections,
  isFirst = false,
}: SectionProps) => {
  const enrollment =
    (course.enrolled ?? null) !== null && (course.enrolledMax ?? null) !== null
      ? applyIndicatorPercent(
          `${course.enrolled}/${course.enrolledMax} enrolled`,
          course.enrolled / course.enrolledMax
        )
      : 'Enrollment N/A';

  const units = formatUnits(course.units);
  const { schedule, setSchedule } = useScheduleContext();

  const shouldScroll = sections.length > MAX_SECTIONS_BEFORE_SCROLL;
  return (
    <section>
      <h4>{sections[0].kind}</h4>
      {isFirst && (
        <>
          <p>
            {course.title} &bull; {sections[0].instructor}
          </p>
          <p>
            {enrollment} &bull; {units} &bull; CCN: {sections[0].ccn}
          </p>
        </>
      )}
      <section
        className="course-card-scroll"
        style={{
          overflow: shouldScroll ? 'auto' : '',
          height: shouldScroll ? SCROLL_SECTION_HEIGHT : '',
        }}
      >
        {sections.map((section) => {
          const hasEnrollmentData =
            (section.enrolled ?? null) !== null &&
            (section.enrolledMax ?? null) !== null;

          const labelComponents = [
            section.wordDays,
            formatSectionTime(section),
            section.locationName && formatLocation(section.locationName),
            hasEnrollmentData &&
              `${section.enrolled}/${section.enrolledMax} enrolled`,
          ];

          const components = labelComponents
            .filter(Boolean)
            .reduce<ReactNode[]>((a, b) => [...a, ', ', b], [])
            .slice(1);

          const sectionLabel = (
            <span className="section-label">
              {hasEnrollmentData && (
                <span
                  className="section-label-box"
                  style={{
                    background: getIndicatorPercent(
                      section.enrolled! / section.enrolledMax!
                    ),
                  }}
                />
              )}
              {components}
            </span>
          );

          function setChecked(event: ChangeEvent<HTMLInputElement>) {
            let newSchedule: Schedule = {
              ...schedule,
              sections: schedule.sections.filter(s => s.id !== section.id)
            };

            // If it's not checked, then we'll check it
            if (event.target.checked) {
              newSchedule.sections.push({
                ...section,
                courseId: course.id
              });
            }

            setSchedule(newSchedule);
          }

          const checked = hasSectionById(schedule, section.id);
          return (
            <div key={section.id}>
              <Form.Check
                custom
                type="checkbox"
                style={{
                  opacity: section.disabled ? 0.5 : undefined
                }}
                checked={checked}
                onChange={setChecked}
                label={sectionLabel}
                id={`${section.id}-check`}
                name={`${section.id}-check`}
              />
            </div>
          );
        })}
      </section>
    </section>
  );
};

type Props = {
  course: CourseFragment;
  color: string;
};

const CourseCard = ({ course, color }: Props) => {
  const sections = course.sectionSet.edges.map((e) => e?.node!);

  const items = groupSections(sections);

  return (
    <div
      className="course-card"
      style={{ '--card-color': color } as CSSProperties}
    >
      {items.map(({ category, sections }, index) => (
        <CourseCardSection
          key={category}
          isFirst={index === 0}
          course={course}
          sections={sections}
        />
      ))}
    </div>
  );
};

export default CourseCard;
