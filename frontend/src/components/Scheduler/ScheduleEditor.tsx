import React, { ChangeEvent, ReactNode, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import CourseSelector from 'components/Scheduler/CourseSelector';

import { useGetCoursesForFilterQuery } from '../../graphql/graphql';
import BTLoader from 'components/Common/BTLoader';
import {
  Schedule,
  SchedulerSectionType,
  scheduleToICal,
} from 'utils/scheduler/scheduler';
import SchedulerCalendar from 'components/Scheduler/Calendar/SchedulerCalendar';
import AccessControl from './AccessControl';
import { AccessStatus } from 'utils/scheduler/accessStatus';
import { useSemester } from 'graphql/hooks/semester';
import { getNodes } from 'utils/graphql';
import { Semester } from 'utils/playlists/semesters';

type Props = {
  /**
   * The semester being edited. If not provided, will
   * assume the latest semester.
   */
  semester?: Semester;

  /**
   * The users schedule.
   */
  schedule: Schedule;

  /**
   * Called when the schedule should be updated.
   */
  setSchedule: (newSchedule: Schedule) => void;

  /**
   * This is the widget to show next to the title.
   * It typically represents the schedule's save state.
   */
  saveWidget?: ReactNode;

  /**
   * If provided, shows access control with the
   * specified ID.
   */
  accessControl?: string;
};

const ScheduleEditor = ({
  schedule,
  semester,
  setSchedule,
  saveWidget,
  accessControl,
}: Props) => {
  const { semester: latestSemester, error: semesterError } = useSemester(
    semester
  );

  // Only load the list of filters once we have the latest semester. If we
  // didn't wait, we'd load all semesters' classes which is way to many.
  const { data, error: coursesError } = useGetCoursesForFilterQuery({
    variables: {
      playlists: latestSemester?.playlistId!,
    },
    skip: !latestSemester,
  });

  // If the user is hovering over a section. This will store that section
  const [
    previewSection,
    setPreviewSection,
  ] = useState<SchedulerSectionType | null>(null);

  const setScheduleName = (event: ChangeEvent<HTMLInputElement>) =>
    setSchedule({
      ...schedule,
      name: event.target.value,
    });

  const setScheduleVisibility = (newAccess: AccessStatus) =>
    setSchedule({
      ...schedule,
      access: newAccess,
    });

  if (!data || !semester) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          {semesterError || coursesError ? (
            'An error occured loading scheduler information. Please try again later.'
          ) : (
            <BTLoader />
          )}
        </div>
      </div>
    );
  }

  function exportToCalendar() {
    const icsData = scheduleToICal(schedule, semester!);
    const icsURI =
      `data:text/calendar;charset=utf8,` + encodeURIComponent(icsData);

    const link = document.createElement('a');
    link.href = icsURI;
    link.download = `${schedule.name}.ics`;
    link.click();
  }

  const allCourses = getNodes(data.allCourses!);

  return (
    <Row noGutters>
      <Col md={4} lg={4} xl={4}>
        <CourseSelector
          allCourses={allCourses}
          semester={semester}
          schedule={schedule}
          setSchedule={setSchedule}
          setPreviewSection={setPreviewSection}
        />
      </Col>
      <Col>
        <div className="scheduler-header">
          <div>
            <input
              type="text"
              value={schedule.name}
              onChange={setScheduleName}
              placeholder="Schedule Name"
              className="scheduler-name-input mr-3"
            />
            {saveWidget}
          </div>
          <div>
            {accessControl && (
              <AccessControl
                visibility={schedule.access}
                setVisibility={setScheduleVisibility}
                scheduleId={accessControl}
              />
            )}
            <Button
              className="bt-btn-inverted ml-3"
              size="sm"
              onClick={exportToCalendar}
            >
              Export to Calendar
            </Button>
          </div>
        </div>
        <SchedulerCalendar
          schedule={schedule}
          setSchedule={setSchedule}
          previewSection={previewSection}
        />
      </Col>
    </Row>
  );
};

export default ScheduleEditor;
