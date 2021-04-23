import React from 'react';
import { useGetScheduleForIdQuery } from '../../graphql/graphql';
import BTLoader from 'components/Common/BTLoader';
import { Redirect, useParams } from 'react-router';
import {
  deserializeSchedule,
  getUnitsForSchedule,
} from 'utils/scheduler/scheduler';
import SchedulerCalendar from 'components/Scheduler/Calendar/SchedulerCalendar';
import { unitsToString } from 'utils/courses/units';

const ViewSchedule = () => {
  const { scheduleId } = useParams<{ scheduleId?: string }>();

  const { data, error } = useGetScheduleForIdQuery({
    variables: { id: scheduleId! },
    skip: scheduleId === undefined,
  });

  if (!scheduleId) {
    return <Redirect to="/" />;
  }

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

  const schedule = deserializeSchedule(data.schedule!);
  const totalUnits = getUnitsForSchedule(schedule);

  return (
    <div className="scheduler viewport-app schedule-standalone-content">
      <div className="scheduler-header">
        <div>
          <span>Selected units: {unitsToString(totalUnits)}</span>
        </div>
        <div>
          <input
            type="text"
            value={schedule.name}
            readOnly
            className="scheduler-name-input mr-3"
          />
        </div>
        <div />
      </div>
      <SchedulerCalendar schedule={schedule} />
    </div>
  );
};

export default ViewSchedule;
