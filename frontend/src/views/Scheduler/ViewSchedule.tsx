import { Button } from "bt/custom";
import BTLoader from "components/Common/BTLoader";
import SchedulerCalendar from "components/Scheduler/Calendar/SchedulerCalendar";
import { useUser } from "graphql/hooks/user";
import React from "react";
import { Redirect, useParams } from "react-router";
import { unitsToString } from "utils/courses/units";
import {
  deserializeSchedule,
  formatScheduleError,
  getUnitsForSchedule,
} from "utils/scheduler/scheduler";

import { useGetScheduleForIdQuery } from "../../graphql/graphql";

const ViewSchedule = () => {
  const { scheduleId: scheduleUUID } = useParams<{ scheduleId?: string }>();
  const { user } = useUser();

  const { data, error } = useGetScheduleForIdQuery({
    variables: { id: btoa(`ScheduleType:${scheduleUUID}`) },
    skip: scheduleUUID === undefined,
  });

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
