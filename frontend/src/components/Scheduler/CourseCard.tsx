import {
  CourseFragment,
  CourseOverviewFragment,
  SectionFragment,
} from 'graphql/graphql';
import React, { CSSProperties } from 'react';
import { Form } from 'react-bootstrap';
import { courseToColor, courseToName } from 'utils/courses/course';
import { formatTime } from 'utils/date';
import { sortSections } from 'utils/sections/sort';
import {
  applyIndicatorPercent,
  formatUnits,
  getIndicatorPercent,
} from 'utils/utils';

import { ReactComponent as Trash } from '../../assets/svg/common/trash.svg';

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
    course.enrolled && course.enrolledMax
      ? applyIndicatorPercent(
          `${course.enrolled}/${course.enrolledMax}`,
          course.enrolled / course.enrolledMax
        )
      : 'N/A';

  const units = formatUnits(course.units);

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
      {sections.map((section) => {
        const sectionLabel = (
          <span className="section-label">
            {(section.enrolled ?? null) !== null &&
              (section.enrolledMax ?? null) !== null && (
                <span
                  className={`section-label-box ${getIndicatorPercent(
                    section.enrolled! / section.enrolledMax!
                  )}`}
                />
              )}
            <span>
              {section.wordDays},{' '}
              {section.startTime && section.endTime
                ? `${formatTime(section.startTime)} - ${formatTime(
                    section.endTime
                  )}`
                : `unknown time`}
            </span>
          </span>
        );

        return (
          <div key={section.id}>
            <Form.Check
              custom
              label={sectionLabel}
              name={`${section.id}-check`}
            />
          </div>
        );
      })}
    </section>
  );
};

type Props = {
  course: CourseFragment;
  color: string;
};

const CourseCard = ({ course, color }: Props) => {
  const sections = course.sectionSet.edges.map((e) => e?.node!);

  const items = sortSections(sections);

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
