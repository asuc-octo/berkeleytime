import React from 'react';
import Preference from './Preference';
import {
  UpdateUserMutationVariables,
  UserProfileFragment,
} from '../../graphql/graphql';
import { useUpdateUser } from '../../graphql/hooks/user';
import Subview from './Subview';

type Props = {
  userProfile: UserProfileFragment;
};

const NotificationsSubview = ({ userProfile }: Props) => {
  const updateUser = useUpdateUser();

  // Helper function to trigger an update mutation.
  const updateProperty = (
    property: (checked: boolean) => UpdateUserMutationVariables
  ) => (checked: boolean) => updateUser(userProfile, property(checked));

  return (
    <Subview title="Email Preferences">
      <Preference
        isChecked={userProfile.emailClassUpdate}
        onChange={updateProperty((checked) => ({
          emailClassUpdate: checked,
        }))}
        text="Class updates in catalog"
      />
      <Preference
        isChecked={userProfile.emailGradeUpdate}
        onChange={updateProperty((checked) => ({
          emailGradeUpdate: checked,
        }))}
        text="Updated grades for saved classes"
      />
      {/*<Preference
        isChecked={userProfile.emailEnrollmentOpening}
        onChange={updateProperty((checked) => ({
          emailEnrollmentOpening: checked,
        }))}
        text="Enrollment openings in catalog"
      />*/}
      <Preference
        isChecked={userProfile.emailBerkeleytimeUpdate}
        onChange={updateProperty((checked) => ({
          emailBerkeleytimeUpdate: checked,
        }))}
        text="Updates to Berkeleytime's software"
      />
    </Subview>
  );
};

export default NotificationsSubview;
