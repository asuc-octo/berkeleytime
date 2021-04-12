import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import CourseSelector from 'components/Scheduler/CourseSelector';

import {
  CourseOverviewFragment,
  useCreateScheduleMutation,
  useGetScheduleForIdLazyQuery,
  useUpdateScheduleMutation,
} from '../../graphql/graphql';
import BTLoader from 'components/Common/BTLoader';
import {
  DEFAULT_SCHEDULE,
  deserializeSchedule,
  Schedule,
  serializeSchedule,
} from 'utils/scheduler/scheduler';
import SchedulerCalendar from 'components/Scheduler/Calendar/SchedulerCalendar';
import { Semester } from 'utils/playlists/semesters';
import { getNodes } from 'utils/graphql';
import { debounce } from 'utils/fn';
import Callout from './Callout';

// This is NOT an interval. Rather it combines all
// changes within this time interval into one
// update event. This means there will be at MOST
// one event sent in each of the specfied interval.
const SCHEDULER_AUTOSAVE_INTERVAL = 500;

type Props = {
  allCourses: CourseOverviewFragment[];
  semester: Semester;
  scheduleId: string | null;
  setScheduleId: (newScheduleId: string) => void;
  schedule: Schedule;
  setRawSchedule: Dispatch<SetStateAction<Schedule>>;
};

const ScheduleEditor = ({
  allCourses,
  semester,
  scheduleId,
  setScheduleId,
  schedule,
  setRawSchedule,
}: Props) => {
  const [
    getScheduleForId,
    { loading: isFetchingRemoteSchedule },
  ] = useGetScheduleForIdLazyQuery({
    onCompleted: (data) => {
      // TODO: remove (won't be necessary with dedicated query).
      if (!data.user) {
        alert('You must be logged in to see this schedule.');
        return;
      }
      const schedules = getNodes(data.user!.schedules);

      // TODO: possible race condition. If `scheduleId` changes
      // before response. This shouldn't be an issue once the
      // dedicated query is added.
      const rawSchedule = schedules.find(
        (schedule) => schedule.id === scheduleId
      );

      if (!rawSchedule) {
        alert("That schedule doesn't exist");
        return;
      }

      const schedule = deserializeSchedule(rawSchedule);
      setRawSchedule(schedule);
    },
  });

  useEffect(() => {
    // Clear the update queue
    currentlyPendingUpdate.current = null;

    if (scheduleId !== null) {
      getScheduleForId({
        variables: {
          // scheduleId: scheduleId
        },
      });
    } else {
      // setRawSchedule(DEFAULT_SCHEDULE);
    }
  }, [scheduleId, getScheduleForId]);

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

  // Call this to save a schedule. This gets renewed when the
  // scheduleId changes (to clear the save queue).
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
      try {
        await currentlyPendingUpdate.current;
      } finally {
        // If there was a autosave error, the hook
        // handles that so we don't need to worry.
        setIsVisualSaving(false);
      }
    }, SCHEDULER_AUTOSAVE_INTERVAL),
    [scheduleId]
  );

  async function setSchedule(newSchedule: Schedule) {
    setRawSchedule(newSchedule);

    if (scheduleId) {
      // Wait for previous update to finish before queuing next one
      // In effect, this will result in sequential updates being
      // combined due to saveSchedule being 'debounced'.
      await currentlyPendingUpdate.current;
      setIsVisualSaving(true);
      saveSchedule(newSchedule, semester, scheduleId);
    }
  }

  async function createSchedule() {
    setIsVisualSaving(true);

    try {
      const result = await createScheduleMutation({
        variables: serializeSchedule(schedule, semester),
      });

      if (result.data?.createSchedule?.schedule) {
        setScheduleId(result.data.createSchedule.schedule.id);
      }
    } finally {
      setIsVisualSaving(false);
    }
  }

  const setScheduleName = (event: ChangeEvent<HTMLInputElement>) =>
    setSchedule({
      ...schedule,
      name: event.target.value,
    });

  if (isFetchingRemoteSchedule) {
    return <BTLoader />;
  }

  return (
    <Row noGutters>
      <Col md={4} lg={4} xl={4}>
        <CourseSelector
          allCourses={allCourses}
          semester={semester}
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
            ) : creationError ? (
              <Callout
                type="warning"
                state="error"
                message="Could not save schedule."
              />
            ) : saveError ? (
              <Callout
                type="warning"
                state="error"
                message="Error autosaving."
              />
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
  );
};

export default ScheduleEditor;
