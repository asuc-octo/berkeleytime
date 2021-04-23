import React, { useState } from 'react';
import {
  formatUnits,
  applyIndicatorPercent,
  applyIndicatorGrade,
} from '../../utils/utils';
import {
  CourseOverviewFragment,
  ScheduleOverviewFragment,
} from '../../graphql/graphql';
import { ReactComponent as Trash } from '../../assets/svg/profile/trash.svg';
import { Button } from 'react-bootstrap';
import { useUnsaveCourse } from 'graphql/hooks/saveCourse';
import { Link } from 'react-router-dom';
import { semesterToString } from 'utils/playlists/semesters';
import ScheduleModal from 'components/Scheduler/ScheduleModal';
import { useDeleteSchedule } from 'graphql/hooks/schedule';

type Props = {
  schedule: ScheduleOverviewFragment;
  removable: boolean;
};

const ProfileScheduleCard = ({ schedule, removable }: Props) => {
  const courses = schedule.selectedSections.edges
    .map((section) => section?.node?.course)
    .filter((c): c is CourseOverviewFragment => c !== undefined);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalId, setModalId] = useState<string | null>(null);

  const [deleteSchedule] = useDeleteSchedule();

  return (
    <>
      <div
        className="profile-card"
        onClick={() => {
          setShowModal(true);
          setModalId(schedule.id);
        }}
      >
        <div className="profile-card-info">
          <h6>{schedule.name}</h6>
          <p className="profile-card-info-desc">
            {schedule.totalUnits} units &bull; {semesterToString(schedule)}
          </p>
          <div className="profile-card-info-stats">
            <span>
              {courses
                .map(
                  (course) => `${course.abbreviation} ${course.courseNumber}`
                )
                .join(' • ')}
            </span>
          </div>
        </div>
        {removable && (
          <Button
            className="profile-card-remove"
            variant="link"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();

              deleteSchedule(schedule);
            }}
          >
            <Trash />
          </Button>
        )}
      </div>
      <ScheduleModal
        scheduleId={modalId}
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ProfileScheduleCard;
