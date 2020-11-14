import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import Property from './Property';
import ProfileCard from './ProfileCard';
import EditPencil from '../../assets/svg/profile/edit.svg';
import { useGetUserQuery, UserProfileFragment } from 'graphql/graphql';

type Props = {
  userProfile: UserProfileFragment
};

const AccountSubview = ({
  userProfile
}: Props) => {
  //Information has been hardcoded for testing purposes only
  const options = [
    { value: "Psychology", label: "Psychology" },
    { value: "Physics", label: "Physics" },
    { value: "Philosophy", label: "Philosophy" },
    { value: "Rhetoric", label: "Rhetoric" },
  ];

  const user = userProfile.user;
  console.log(userProfile);
  return (
    <div className="profile-subview">
      <h1>Your Account</h1>
      <h2>Personal Information</h2>

      {/* Information has been hardcoded for testing purposes only */}
      <Property options={options} attribute="Full Name" value={`${user.firstName} ${user.lastName}`} />
      <Property options={options} attribute="bConnected Email" value={user.email} />
      <Property options={options} attribute="Major(s)" value={user.email} />

      <div className="profile-title">
        <h2>Saved Classes</h2>
        <button className="edit-button"><img className="edit-pencil" src={EditPencil} alt="Edit Classes"/></button>
      </div>

      {/* Information has been hardcoded for testing purposes only */}
      {userProfile.savedClasses?.map(course => (
        <ProfileCard
          key={course?.id!}
          course={course!}
        />
      ))}

      <p className="see-all-classes">See all classes</p>
    </div>
  );
}

export default AccountSubview;
