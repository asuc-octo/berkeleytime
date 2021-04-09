import BTLoader from 'components/Common/BTLoader';
import { useGetScheduleForIdQuery } from '../../graphql/graphql';
import React from 'react';
import { Modal } from 'react-bootstrap';
import SchedulerCalendar from './Calendar/SchedulerCalendar';
import { deserializeSchedule } from '../../utils/scheduler/scheduler';
import { Button } from 'bt/custom';

type ContentProps = {
  scheduleId: string;
};
const ScheduleModalContent = ({ scheduleId }: ContentProps) => {
  const { data, loading } = useGetScheduleForIdQuery({
    // variables: { scheduleId },
  });

  if (!data?.user) {
    return loading ? (
      <BTLoader />
    ) : (
      <div className="loading">
        An error occured loading the data. Try again later.
      </div>
    );
  }

  const rawSchedule = data.user.schedules.edges.find(
    (schedule) => schedule?.node?.id === scheduleId
  )?.node!;

  const schedule = deserializeSchedule(rawSchedule);

  return (
    <div className="scheduler schedule-modal-content">
      <div className="scheduler-header">
        <div>
          <span>Selected units: {rawSchedule.totalUnits}</span>
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
