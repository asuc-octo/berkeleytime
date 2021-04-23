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
import ProfileCard from './ProfileCard';

type Props = {
  schedule: ScheduleOverviewFragment;
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
      <ProfileCard
        onClick={() => {
          setShowModal(true);
          setModalId(schedule.id);
        }}
        title={schedule.name}
        subtitle={`${schedule.totalUnits} units \u2022 ${semesterToString(
          schedule
        )}`}
        description={courses
          .map((course) => `${course.abbreviation} ${course.courseNumber}`)
          .join(' • ')}
        didRemove={() => deleteSchedule(schedule)}
      />
      <ScheduleModal
        scheduleId={modalId}
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ProfileScheduleCard;
