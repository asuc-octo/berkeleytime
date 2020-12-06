import React, { useState } from 'react';

import Property from './Property';
import ProfileCard from './ProfileCard';
import EditPencil from '../../assets/svg/profile/edit.svg';
import {
  CourseOverviewFragment,
  UserProfileFragment,
} from '../../graphql/graphql';

import MAJORS from './majors.json';
import { useUpdateUser } from '../../graphql/hooks/user';
import { compareDepartmentName } from 'utils/courses/sorting';
import { Button } from 'react-bootstrap';
import Subview from './Subview';

type Props = {
  userProfile: UserProfileFragment;
};

// Show this many cards before adding a 'show more'
const MAX_PROFILE_CARDS = 6;

const AccountSubview = ({ userProfile }: Props) => {
  const [removable, setRemovable] = useState<boolean>(false);
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

      <Subview
        title="Saved Classes"
        widget={
          savedClasses.length > 0 && (
            <button
              className="edit-button"
              onClick={() => setRemovable((v) => !v)}
            >
              <img
                className="edit-pencil"
                src={EditPencil}
                alt="Edit Classes"
              />
            </button>
          )
        }
      >
        <div className="profile-card-grid">
          {savedClasses.slice(0, MAX_PROFILE_CARDS).map((course) => (
            <ProfileCard
              removable={removable}
              key={course.id}
              course={course}
            />
          ))}
        </div>

        {savedClasses.length > MAX_PROFILE_CARDS && (
          <Button variant="link" className="profile-see-more px-0">
            See all classes
          </Button>
        )}
      </Subview>
    </div>
  );
};

export default AccountSubview;
