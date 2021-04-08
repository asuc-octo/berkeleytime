import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, ButtonGroup, ButtonToolbar, Col, Row } from 'react-bootstrap';
import CourseSelector from 'components/Scheduler/CourseSelector';

import {
  useCreateScheduleMutation,
  useGetCoursesForFilterQuery,
  useUpdateScheduleMutation,
} from '../../graphql/graphql';
import BTLoader from 'components/Common/BTLoader';
import useLatestSemester from 'graphql/hooks/latestSemester';
import {
  DEFAULT_SCHEDULE,
  Schedule,
  serializeSchedule,
} from 'utils/scheduler/scheduler';
import SchedulerCalendar from 'components/Scheduler/Calendar/SchedulerCalendar';
import { useLocalStorageState } from 'utils/hooks';
import { debounce } from 'lodash';
import { Semester } from 'utils/playlists/semesters';
import { serialize } from 'node:v8';

// Change the version when the scheduler schema changes to
// avoid breaking users' schedules
const SCHEDULER_KEY = 'SCHEDULER:v1.0:DEFAULT';

const SCHEDULER_AUTOSAVE_INTERVAL = 500;

const Scheduler = () => {
  const {
    semester: latestSemester,
    error: semesterError,
  } = useLatestSemester();

  // Only load the list of filters once we have the latest semester. If we
  // didn't wait, we'd load all semesters' classes which is way to many.
  const { data, error: coursesError } = useGetCoursesForFilterQuery({
    variables: {
      playlists: latestSemester?.playlistId!,
    },
    skip: !latestSemester?.playlistId,
  });

  const [schedule, setRawSchedule] = useLocalStorageState<Schedule>(
    SCHEDULER_KEY,
    DEFAULT_SCHEDULE
  );

  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const isRemoteSaved = scheduleId !== null;

  // Whether or not we say 'is saving...' may be different from whether
  // or not there is an ongoing network requests. The main constraint
  // is we do NOT want to say the schedule is saved if the schedule as
  // currently shown is not what's on the server.
  const [isVisualSaving, setIsVisualSaving] = useState(false);
  const [
    createScheduleMutation,
    { error: creationError },
  ] = useCreateScheduleMutation();

  const [
    updateScheduleMutation,
    { error: saveError },
  ] = useUpdateScheduleMutation();

  // Stores the currently pending autosave mutation query.
  const currentlyPendingUpdate = useRef<Promise<any> | null>(null);

  // Call this to save a schedule,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveSchedule = useCallback(
    debounce(async (schedule: Schedule, semester: Semester, id: string) => {
      setIsVisualSaving(true);

      const result = updateScheduleMutation({
        variables: {
          scheduleId: id,
          ...serializeSchedule(schedule, semester),
        },
      });

      currentlyPendingUpdate.current = result;
      await currentlyPendingUpdate.current;

      setIsVisualSaving(false);
    }, SCHEDULER_AUTOSAVE_INTERVAL),
    []
  );

  async function setSchedule(newSchedule: Schedule) {
    setRawSchedule(newSchedule);

    if (latestSemester && scheduleId) {
      // Wait for previous update to finish before queuing next one
      // In effect, this will result in sequential updates being
      // combined due to saveSchedule being 'debounced'.
      await currentlyPendingUpdate.current;
      saveSchedule(newSchedule, latestSemester, scheduleId);
    }
  }

  async function createSchedule() {
    if (!latestSemester) return;

    setIsVisualSaving(true);
    const result = await createScheduleMutation({
      variables: serializeSchedule(schedule, latestSemester),
    });

    if (result.data?.createSchedule?.schedule) {
      setScheduleId(result.data.createSchedule.schedule.id);
    }

    setIsVisualSaving(false);
  }

  const error = semesterError || coursesError;

  if (!data) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          {error ? (
            'An error occured loading scheduler information. Please try again later.'
          ) : (
            <BTLoader />
          )}
        </div>
      </div>
    );
  }

  // Get a list of all courses which will be used by the search bar.
  const allCourses = data.allCourses?.edges.map((e) => e?.node!)!;

  const setScheduleName = (event: ChangeEvent<HTMLInputElement>) =>
    setSchedule({
      ...schedule,
      name: event.target.value,
    });

  return (
    <div className="scheduler viewport-app">
      <Row noGutters>
        <Col md={4} lg={4} xl={4}>
          <CourseSelector
            allCourses={allCourses}
            semester={latestSemester!}
            schedule={schedule}
            setSchedule={setSchedule}
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
              {isVisualSaving ? (
                <span>Saving schedule...</span>
              ) : saveError ? (
                <span>Error saving</span>
              ) : isRemoteSaved ? (
                <span>Schedule saved.</span>
              ) : (
                <Button
                  className="bt-btn-primary"
                  size="sm"
                  onClick={createSchedule}
                >
                  Save
                </Button>
              )}
            </div>
            <div>
              <Button className="bt-btn-inverted" size="sm">
                Export to Google Calendar
              </Button>
            </div>
          </div>
          <SchedulerCalendar schedule={schedule} />
        </Col>
      </Row>
    </div>
  );
};

export default Scheduler;
