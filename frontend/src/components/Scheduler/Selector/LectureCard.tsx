import {
  LectureFragment,
  SchedulerCourseFragment,
} from 'graphql/graphql';
import { ChangeEvent } from 'react';
import { Form } from 'react-bootstrap';

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

type Props = {
  section: LectureFragment;
  course: SchedulerCourseFragment;

  /**
   * User-readable string identifying the section
   */
  sectionId?: string;
};

const LectureCard = ({ section, course, sectionId }: Props) => {
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
    <div className="course-card">
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
                { section.instructor ? section.instructor : section.kind + " " + sectionId }
              </span>
            }
            id={`${section.id}-check`}
            name={`${section.id}-check`}
          />
        </h4>
        <p className="course-card-description">
          {section.wordDays}, {formatSectionTime(section)},{' '}
          {formatLocation(section.locationName)}
        </p>
        <p className="course-card-description">
          {formatSectionEnrollment(section)} &bull; CCN: {section.ccn}
        </p>
      </section>
    </div>
  );
};

export default LectureCard;
