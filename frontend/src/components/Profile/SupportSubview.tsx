import { useDeleteUser } from '../../graphql/hooks/user';
import React from 'react';
import Resource from './Resource';
import Subview from './Subview';

const SupportSubview = () => {
  const [deleteUser, { loading }] = useDeleteUser();

  function deleteAccount() {
    const didConfirm = window.confirm(
      `Are you sure you wish to IRREVERSIBLY delete your account?`
    );
    if (didConfirm) {
      deleteUser();
    }
  }

  return (
    <div className="support-view">
      <Subview title="Resources">
        <Resource text="Contact Us" link="mailto:octo.berkeleytime@asuc.org" />
        <Resource text="Report a bug" link="/bugs" />
        {loading ? (
          <Resource text="Deleting Account..." isDestructive />
        ) : (
          <Resource
            text="Delete Account"
            onClick={deleteAccount}
            isDestructive
          />
        )}
      </Subview>
    </div>
  );
};

export default SupportSubview;
