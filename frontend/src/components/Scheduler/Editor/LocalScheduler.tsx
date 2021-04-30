import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { CourseOverviewFragment } from '../../../graphql/graphql';
import BTLoader from 'components/Common/BTLoader';
import { DEFAULT_SCHEDULE, Schedule } from 'utils/scheduler/scheduler';
import { Semester } from 'utils/playlists/semesters';
import { useUser } from 'graphql/hooks/user';
import { useCreateSchedule } from 'graphql/hooks/schedule';
import { useLocalStorageState } from 'utils/hooks';
import ScheduleEditor from '../ScheduleEditor';
import { useHistory } from 'react-router';
import { useSemester } from 'graphql/hooks/semester';
import Callout from '../Callout';

// Update the version when the scheduler schema changes.
const SCHEDULER_LOCALSTORAGE_KEY = 'schedule:save:v1.0';

type Props = {
  allCourses: CourseOverviewFragment[];
  semester: Semester;
  scheduleId: string | null;
};

const LocalScheduler = () => {
  const [schedule, setSchedule] = useLocalStorageState<Schedule>(
    SCHEDULER_LOCALSTORAGE_KEY,
    DEFAULT_SCHEDULE
  );

  const { isLoggedIn, loading: loadingUser } = useUser();
  const history = useHistory();

  const { semester, error: semesterError } = useSemester();

  const [
    createScheduleMutation,
    { loading: isSaving, error: creationError },
  ] = useCreateSchedule({
    onCompleted: (data) => {
      if (data?.createSchedule?.schedule) {
        const scheduleId = data.createSchedule.schedule.id;

        // Clear the saved schedule
        setSchedule(DEFAULT_SCHEDULE);

        // Redirect to the saved schedule editor.
        const scheduleUUID = atob(scheduleId).split(':')[1];

        // Defer this to the next tick
        setTimeout(() => {
          history.push(`/scheduler/${scheduleUUID}`);
        });
      }
    },
  });

  if (!semester) {
    return (
      <BTLoader
        message="Loading semester information..."
        error={semesterError}
        fill
      />
    );
  }

  const createSchedule = async () =>
    await createScheduleMutation(schedule, semester!);

  const saveButton = (
    <Button
      className="bt-btn-primary px-3"
      size="sm"
      onClick={createSchedule}
      disabled={!isLoggedIn}
      style={{ pointerEvents: !isLoggedIn ? 'none' : undefined }}
    >
      Save
    </Button>
  );

  return (
    <ScheduleEditor
      schedule={schedule}
      semester={semester}
      setSchedule={setSchedule}
      saveWidget={
        isSaving ? (
          <span>Saving schedule...</span>
        ) : creationError ? (
          <Callout
            type="warning"
            state="error"
            message="Could not save schedule."
          />
        ) : !isLoggedIn ? (
          <OverlayTrigger
            overlay={
              <Tooltip id="schedule-save-popover">
                {loadingUser
                  ? 'Loading account...'
                  : 'You must be logged in to save.'}
              </Tooltip>
            }
            placement="bottom"
          >
            <span className="d-inline-block">{saveButton}</span>
          </OverlayTrigger>
        ) : (
          saveButton
        )
      }
    />
  );
};

export default LocalScheduler;
