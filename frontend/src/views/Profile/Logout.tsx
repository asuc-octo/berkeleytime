import BTLoader from 'components/Common/BTLoader';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router';

const Logout = () => {
  // TODO: implement logout with mutation
  const history = useHistory();
  useEffect(() => {
    history.goBack();
  }, [history]);

  return (
    <div className="logout viewport-app">
      <div className="logout__status">
        <BTLoader />
      </div>
    </div>
  );
};

export default Logout;
