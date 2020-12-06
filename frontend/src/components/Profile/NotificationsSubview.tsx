import React from 'react';
import Preference from './Preference';
import { UserProfileFragment } from '../../graphql/graphql';

type Props = {
  userProfile: UserProfileFragment
}

const NotificationsSubview = ({
  userProfile
}: Props) => {
  return (
    <div className="profile-subview">
      <h1>Notifications</h1>
      <h2>Email Preferences</h2>
      <Preference
        isChecked={userProfile.emailClassUpdate}
        text="Class updates in catalog"
      />
      <Preference
        isChecked={userProfile.emailGradeUpdate}
        text="Updated grades for saved classes"
      />
      <Preference
        isChecked={userProfile.emailEnrollmentOpening}
        text="Enrollment openings in catalog"
      />
      <Preference
        isChecked={userProfile.emailBerkeleytimeUpdate}
        text="Updates to Berkeleytime's software"
      />
    </div>
  );
}

export default NotificationsSubview;