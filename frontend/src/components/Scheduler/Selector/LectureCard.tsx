import {
  LectureFragment,
  SchedulerCourseFragment,
  SectionFragment,
} from 'graphql/graphql';
import React, { ChangeEvent, CSSProperties } from 'react';
import { Form } from 'react-bootstrap';
import cx from 'classnames';

import {
  hasSectionById,
  Schedule,
  SchedulerSectionType,
} from 'utils/scheduler/scheduler';
import {
  formatLocation,
  formatSectionEnrollment,
  formatSectionTime,
} from 'utils/sections/section';
import { groupSections } from 'utils/sections/sort';
import { useScheduleContext } from '../ScheduleContext';
import { combineNodes } from 'utils/string';

const MAX_SECTIONS_BEFORE_SCROLL: number = 8;
const SCROLL_SECTION_HEIGHT: string = '280px';

type SectionProps = {
  key: string;
  sections: SectionFragment[];
  course: SchedulerCourseFragment;
  lecture: SectionFragment;
  isDisabled?: boolean;
};

const SectionGroup = ({
  sections,
  course,
  lecture,
  isDisabled = false,
}: SectionProps) => {
  const { schedule, setSchedule, setPreviewSection } = useScheduleContext();

  const shouldScroll = sections.length > MAX_SECTIONS_BEFORE_SCROLL;

  return (
    <section
      className={cx({
        'course-card--disabled': isDisabled,
      })}
    >
      <h4>{sections[0].kind}</h4>
      <section
        className="course-card-scroll"
        style={{
          overflow: shouldScroll ? 'auto' : '',
          height: shouldScroll ? SCROLL_SECTION_HEIGHT : '',
        }}
      >
        {sections.map((section) => {
          const currentSection: SchedulerSectionType = {
            ...section,
            courseId: course.id,
            lectureId: lecture.id,
          };

          const sectionLabel = (
            <span className="section-label">
              <strong>{section.sectionNumber}: </strong>
              {combineNodes(
                [
                  section.wordDays,
                  formatSectionTime(section, false),
                  formatLocation(section.locationName),
                  formatSectionEnrollment(section),
                ],
                ', '
              )}{' '}
              &bull; CCN: {section.ccn}
            </span>
          );

          function setChecked(event: ChangeEvent<HTMLInputElement>) {
            let newSchedule: Schedule = {
              ...schedule,
              sections: schedule.sections.filter((s) => s.id !== section.id),
            };

            // If it's not checked, then we'll check it
            if (event.target.checked) {
              newSchedule.sections.push(currentSection);
            }

            setSchedule(newSchedule);
          }

          const checked = hasSectionById(schedule, section.id);
          return (
            <div
              key={section.id}
              onMouseEnter={() => setPreviewSection?.(currentSection)}
              onMouseLeave={() => setPreviewSection?.(null)}
            >
              <Form.Check
                custom
                disabled={isDisabled}
                type="checkbox"
                style={{
                  opacity: section.disabled ? 0.5 : undefined,
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
  section: LectureFragment;
  course: SchedulerCourseFragment;

  /**
   * User-readable string identifying the section
   */
  sectionId?: string;
  color: string;
};

const LectureCard = ({ section, course, sectionId, color }: Props) => {
  const associatedSections = section.associatedSections.edges.map(
    (e) => e?.node!
  );

  const currentSection: SchedulerSectionType = {
    ...section,
    courseId: course.id,
  };

  // Groups sections [sec1, sec2] into 'discussion, 'lecture', etc.
  // and sorts appropriately.
  const sectionTypes = groupSections(associatedSections);

  const { schedule, setSchedule, setPreviewSection } = useScheduleContext();
  const checked = hasSectionById(schedule, section.id);

  function setChecked(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      let newSchedule: Schedule = {
        ...schedule,
        sections: schedule.sections
          .filter((s) => s.courseId !== course.id || s.lectureId === section.id)
          .concat([currentSection]),
      };

      setSchedule(newSchedule);
    } else {
      let newSchedule: Schedule = {
        ...schedule,
        sections: schedule.sections.filter(
          (s) => !(s.id === section.id || s.lectureId === section.id)
        ),
      };

      setSchedule(newSchedule);
    }
  }

  return (
    <div
      className="course-card"
      style={{ '--card-color': color } as CSSProperties}
    >
      <section
        onMouseEnter={() => setPreviewSection?.(currentSection)}
        onMouseLeave={() => setPreviewSection?.(null)}
      >
        <h4>
          <Form.Check
            custom
            type="checkbox"
            style={{
              opacity: section.disabled ? 0.5 : undefined,
            }}
            checked={checked}
            onChange={setChecked}
            label={
              <span>
                {section.kind} {sectionId}
              </span>
            }
            id={`${section.id}-check`}
            name={`${section.id}-check`}
          />
        </h4>
        <p className="course-card-description">
          {section.instructor ? section.instructor + ` \u{2022} ` : ''}
          {section.wordDays}, {formatSectionTime(section)},{' '}
          {formatLocation(section.locationName)}
        </p>
        <p className="course-card-description">
          {formatSectionEnrollment(section)} &bull; CCN: {section.ccn}
        </p>
      </section>
      {sectionTypes.map(({ category, sections }) => (
        <SectionGroup
          key={category}
          sections={sections}
          course={course}
          lecture={section}
          isDisabled={!checked}
        />
      ))}
    </div>
  );
};

export default LectureCard;
