import BTLoader from "components/Common/BTLoader";
import { useUser } from "graphql/hooks/user";
import React from "react";

import SchedulerOnboard from "./SchedulerOnboard";

const Scheduler = () => {
  const { loading: userLoading } = useUser();

  if (userLoading) {
    return (
      <div className="scheduler viewport-app">
        <div className="scheduler__status">
          <BTLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="scheduler viewport-app">
      <SchedulerOnboard />
    </div>
  );
};

export default Scheduler;
