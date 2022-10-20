import React from 'react';
import { useGetScheduleForIdQuery } from '../../graphql/graphql';
import BTLoader from 'components/Common/BTLoader';
import { Redirect, useParams } from 'react-router';
import {
  deserializeSchedule,
  formatScheduleError,
  getUnitsForSchedule,
} from 'utils/scheduler/scheduler';
import SchedulerCalendar from 'components/Scheduler/Calendar/SchedulerCalendar';
import { unitsToString } from 'utils/courses/units';
import { useUser } from 'graphql/hooks/user';
import { Button } from 'bt/custom';
import { ReduxState } from 'redux/store';
import { useSelector } from "react-redux";

const ViewSchedule = () => {
  const { scheduleId: scheduleUUID } = useParams<{ scheduleId?: string }>();
  const { user } = useUser();

  const { data, error } = useGetScheduleForIdQuery({
    variables: { id: btoa(`ScheduleType:${scheduleUUID}`) },
    skip: scheduleUUID === undefined,
  });

  const isMobile = useSelector((state: ReduxState) => state.common.mobile);

  if (isMobile) {
    return (
      <div className="scheduler viewport-app">
        <div className="onboard">
          <p className="py-5 px-2 mobile">Unfortunately, the Scheduler does not support mobile devices at this time.</p>
        </div>
      </div>
    );
  }

  if (!scheduleUUID) {
    return <Redirect to="/" />;
  }

  if (!data) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          <BTLoader fill error={formatScheduleError(error)} />
        </div>
      </div>
    );
  }

  const schedule = deserializeSchedule(data.schedule!);
  const scheduleOwner = data.schedule!.user.user;
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
        <div>
          {scheduleOwner.id === user?.user.id ? (
            <Button
              className="bt-btn-primary"
              size="sm"
              href={`/scheduler/${scheduleUUID}`}
            >
              Edit
            </Button>
          ) : (
            <span className="scheduler-header-strong">
              by {scheduleOwner.firstName} {scheduleOwner.lastName}
            </span>
          )}
        </div>
      </div>
      <SchedulerCalendar schedule={schedule} />
    </div>
  );
};

export default ViewSchedule;
