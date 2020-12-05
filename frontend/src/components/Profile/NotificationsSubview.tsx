import React from 'react';
import Preference from './Preference';
import { UserProfileFragment } from '../../graphql/graphql';
import { useUpdateUser } from '../../graphql/hooks/user';

type Props = {
  userProfile: UserProfileFragment;
};

const NotificationsSubview = ({ userProfile }: Props) => {
  const updateUser = useUpdateUser();

  return (
    <div className="profile-subview">
      <h1>Notifications</h1>
      <h2>Email Preferences</h2>
      <Preference
        isChecked={userProfile.emailClassUpdate}
        onChange={(checked) =>
          updateUser(userProfile, {
            emailClassUpdate: checked,
          })
        }
        text="Class updates in catalog"
      />
      <Preference
        isChecked={userProfile.emailGradeUpdate}
        onChange={(checked) =>
          updateUser(userProfile, {
            emailGradeUpdate: checked,
          })
        }
        text="Updated grades for saved classes"
      />
      <Preference
        isChecked={userProfile.emailEnrollmentOpening}
        onChange={(checked) =>
          updateUser(userProfile, {
            emailEnrollmentOpening: checked,
          })
        }
        text="Enrollment openings in catalog"
      />
      <Preference
        isChecked={userProfile.emailBerkeleytimeUpdate}
        onChange={(checked) =>
          updateUser(userProfile, {
            emailBerkeleytimeUpdate: checked,
          })
        }
        text="Updates to Berkeleytime's software"
      />
    </div>
  );
};

export default NotificationsSubview;
