import BTLoader from 'components/Common/BTLoader';
import { useLogout, useUser } from '../../graphql/hooks/user';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router';

const Logout = () => {
  const history = useHistory();
  const [logout, { error }] = useLogout();
  const { isLoggedIn } = useUser();

  // Log the user out when they visit this page
  useEffect(() => {
    logout();
  }, [logout]);

  // If the logout was successful go to the previous page.
  useEffect(() => {
    if (!isLoggedIn) {
      history.goBack();
    }
  }, [isLoggedIn, history]);

  return (
    <div className="logout viewport-app">
      <div className="logout-status">
        {error ? (
          <span>There was an error logging you out. Try refreshing</span>
        ) : (
          <>
            <BTLoader message="Logging you out..." fill />
          </>
        )}
      </div>
    </div>
  );
};

export default Logout;
