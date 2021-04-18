import BTLoader from 'components/Common/BTLoader';
import { useGetScheduleForIdQuery } from '../../graphql/graphql';
import React from 'react';
import { Modal } from 'react-bootstrap';
import SchedulerCalendar from './Calendar/SchedulerCalendar';
import {
  deserializeSchedule,
  getUnitsForSchedule,
} from '../../utils/scheduler/scheduler';
import { Button } from 'bt/custom';
import { unitsToString } from 'utils/courses/units';

type ContentProps = {
  scheduleId: string;
};
const ScheduleModalContent = ({ scheduleId }: ContentProps) => {
  const { data, loading } = useGetScheduleForIdQuery({
    variables: { id: scheduleId },
  });

  if (!data) {
    return loading ? (
      <BTLoader />
    ) : (
      <div className="loading">
        An error occured loading the data. Try again later.
      </div>
    );
  }

  if (!data.schedule) {
    return <div className="loading">That schedule could not be found.</div>;
  }

  const schedule = deserializeSchedule(data.schedule);
  const totalUnits = getUnitsForSchedule(schedule);

  return (
    <div className="scheduler schedule-modal-content">
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
          <Button
            className="bt-btn-primary"
            size="sm"
            href={`/scheduler/${scheduleId}`}
          >
            Edit
          </Button>
        </div>
      </div>
      <SchedulerCalendar schedule={schedule} />
    </div>
  );
};

type Props = {
  scheduleId: string | null;
  show: boolean;
  handleClose: () => void;
};

const ScheduleModal = ({ scheduleId, show, handleClose }: Props) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="schedule-modal default-modal"
    >
      {scheduleId && <ScheduleModalContent scheduleId={scheduleId} />}
    </Modal>
  );
};

export default ScheduleModal;
