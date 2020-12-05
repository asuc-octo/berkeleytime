import React, { useState } from 'react';

import Property from './Property';
import ProfileCard from './ProfileCard';
import EditPencil from '../../assets/svg/profile/edit.svg';
import { UserProfileFragment } from 'graphql/graphql';

import MAJORS from './majors.json';

type Props = {
  userProfile: UserProfileFragment;
};

const AccountSubview = ({ userProfile }: Props) => {
  const [removable, setRemovable] = useState<boolean>(false);

  //Information has been hardcoded for testing purposes only
  const majorOptions = MAJORS.map((major) => ({
    label: major,
    value: major,
  }));

  const user = userProfile.user;

  return (
    <div className="profile-subview">
      <h1>Your Account</h1>
      <h2>Personal Information</h2>

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
        value={userProfile.major}
      />

      <div className="profile-title">
        <h2>Saved Classes</h2>
        <button className="edit-button" onClick={() => setRemovable((v) => !v)}>
          <img className="edit-pencil" src={EditPencil} alt="Edit Classes" />
        </button>
      </div>

      {userProfile.savedClasses?.map((course) => (
        <ProfileCard removable={removable} key={course?.id!} course={course!} />
      ))}

      <p className="see-all-classes">See all classes</p>
    </div>
  );
};

export default AccountSubview;
