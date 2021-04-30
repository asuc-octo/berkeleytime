import BTLoader from 'components/Common/BTLoader';
import {
  useGetScheduleForIdLazyQuery,
  useUpdateScheduleMutation,
} from '../../../graphql/graphql';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  deserializeSchedule,
  Schedule,
  serializeSchedule,
} from 'utils/scheduler/scheduler';
import ScheduleEditor from '../ScheduleEditor';
import { Semester } from 'utils/playlists/semesters';
import { debounce } from 'lodash';
import Callout from '../Callout';

// This is NOT a loop. Rather it combines all
// changes within this time interval into one
// update event. This means there will be at MOST
// one event sent in each of the specfied interval.
const SCHEDULER_AUTOSAVE_INTERVAL = 500;

type Props = {
  scheduleId: string;
};

const RemoteScheduler = ({ scheduleId }: Props) => {
  const [schedule, setRawSchedule] = useState<Schedule | null>(null);
  const [semester, setSemester] = useState<Semester | null>(null);

  // Whether or not we say 'is saving...' may be different from whether
  // or not there is an ongoing network requests. The main constraint
  // is we do NOT want to say the schedule is saved if the schedule as
  // currently shown is not what's on the server.
  const [isSaving, setIsSaving] = useState(false);

  // Stores the currently pending autosave mutation query.
  const currentlyPendingUpdate = useRef<Promise<any> | null>(null);

  const [
    getScheduleForId,
    { loading: isLoadingSchedule, error: scheduleLoadError },
  ] = useGetScheduleForIdLazyQuery({
    onCompleted: (data) => {
      if (!data.schedule) {
        alert(`Couldn't find the given schedule.`);
        return;
      }

      const schedule = deserializeSchedule(data.schedule);
      setRawSchedule(schedule);
      setSemester(data.schedule);
    },
  });

  useEffect(() => {
    // Clear the update queue
    currentlyPendingUpdate.current = null;

    getScheduleForId({
      variables: {
        id: scheduleId,
      },
    });

    // NOTE: potential race condition. Any pending getScheduleForId
    // should be canceled when the scheduleId changes. This is not
    // implemented as Apollo doesn't seem to allow you to easily
    // cancel requests, and it's not expected to happen because
    // usually the requests come back in the same order.
  }, [scheduleId, getScheduleForId]);

  const [
    updateScheduleMutation,
    { error: saveError },
  ] = useUpdateScheduleMutation();

  // Call this to save a schedule. This gets renewed when the
  // scheduleId changes (to clear the save queue).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveSchedule = useCallback(
    debounce(async (schedule: Schedule, semester: Semester, id: string) => {
      setIsSaving(true);

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
        setIsSaving(false);
      }
    }, SCHEDULER_AUTOSAVE_INTERVAL),
    [scheduleId]
  );

  if (!schedule || !semester) {
    return (
      <BTLoader error={scheduleLoadError} message="Fetching schedule..." fill />
    );
  }

  async function setSchedule(newSchedule: Schedule) {
    setRawSchedule(newSchedule);

    // Wait for previous update to finish before queuing next one
    // In effect, this will result in sequential updates being
    // combined due to saveSchedule being 'debounced'. This is
    // also done to avoid data races.
    await currentlyPendingUpdate.current;
    setIsSaving(true);
    saveSchedule(newSchedule, semester!, scheduleId);
  }

  return (
    <ScheduleEditor
      schedule={schedule}
      semester={semester}
      setSchedule={setSchedule}
      accessControl={scheduleId}
      saveWidget={
        isSaving ? (
          <span>Saving schedule...</span>
        ) : saveError ? (
          <Callout type="warning" state="error" message="Error autosaving." />
        ) : (
          <span>Schedule saved.</span>
        )
      }
    />
  );
};

export default RemoteScheduler;
