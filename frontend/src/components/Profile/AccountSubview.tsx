import React, { useState } from 'react';

import Property from './Property';
import ProfileCourseCard from './ProfileCourseCard';
import EditPencil from '../../assets/svg/profile/edit.svg';
import {
  CourseOverviewFragment,
  ScheduleOverviewFragment,
  UserProfileFragment,
} from '../../graphql/graphql';

import MAJORS from './majors.json';
import { useUpdateUser } from '../../graphql/hooks/user';
import { useUnsaveCourse } from '../../graphql/hooks/saveCourse';
import { compareDepartmentName } from 'utils/courses/sorting';
import { Button } from 'react-bootstrap';
import Subview from './Subview';
import { Link } from 'react-router-dom';
import ProfileScheduleCard from './ProfileScheduleCard';

type Props = {
  userProfile: UserProfileFragment;
};

// Show this many cards before adding a 'show more'
const MAX_PROFILE_CARDS = 6;

const AccountSubview = ({ userProfile }: Props) => {
  const [showAllCourses, setShowAllCourses] = useState<boolean>(false);
  const [showAllSchedules, setShowAllSchedules] = useState<boolean>(false);

  const updateUser = useUpdateUser();

  //Information has been hardcoded for testing purposes only
  const majorOptions = MAJORS.map((major) => ({
    label: major,
    value: major,
  }));

  const user = userProfile.user;
  const savedClasses = (userProfile.savedClasses || [])
    .filter((c): c is CourseOverviewFragment => c !== null)
    .sort(compareDepartmentName);

  const savedSchedules = userProfile.schedules.edges
    .map((schedule) => schedule?.node)
    .filter((s): s is ScheduleOverviewFragment => s !== null)
    .sort((a, b) => Date.parse(b.dateCreated) - Date.parse(a.dateCreated));

  return (
    <div className="account-view">
      <Subview title="Personal Information">
        <Property
          options={majorOptions}
          attribute="Full Name"
          value={`${user.firstName} ${user.lastName}`}
        />
        <Property
          options={majorOptions}
          attribute="bConnected Email"
          value={user.email}
        />
        <Property
          options={majorOptions}
          attribute="Major(s)"
          major={userProfile.major}
          updateMajor={({ value }: { value: string }) =>
            updateUser(userProfile, {
              major: value,
            })
          }
        />
      </Subview>

      <Subview title="Saved Classes">
        {savedClasses.length > 0 ? (
          <div className="profile-card-grid">
            {(showAllCourses
              ? savedClasses
              : savedClasses.slice(0, MAX_PROFILE_CARDS)
            ).map((course) => (
              <ProfileCourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bt-light-text">
            Click on the bookmark icons in <Link to="/catalog">Catalog</Link> to
            start saving classes!
          </div>
        )}

        {savedClasses.length > MAX_PROFILE_CARDS && (
          <Button
            onClick={() => setShowAllCourses((v) => !v)}
            variant="link"
            className="profile-see-more px-0"
          >
            {showAllCourses ? 'Show fewer classes' : 'See all classes'}
          </Button>
        )}
      </Subview>

      <Subview title="Saved Schedules">
        {savedSchedules.length > 0 ? (
          <div className="profile-card-grid">
            {(showAllSchedules
              ? savedSchedules
              : savedSchedules.slice(0, MAX_PROFILE_CARDS)
            ).map((course) => (
              <ProfileScheduleCard key={course.id} schedule={course} />
            ))}
          </div>
        ) : (
          <div className="bt-light-text">
            You do not have any saved schedules.{' '}
            <Link to="/scheduler">Build one now.</Link>
          </div>
        )}

        {savedSchedules.length > MAX_PROFILE_CARDS && (
          <Button
            onClick={() => setShowAllSchedules((v) => !v)}
            variant="link"
            className="profile-see-more px-0"
          >
            {showAllSchedules ? 'Show fewer schedules' : 'See all schedules'}
          </Button>
        )}
      </Subview>
    </div>
  );
};

export default AccountSubview;
