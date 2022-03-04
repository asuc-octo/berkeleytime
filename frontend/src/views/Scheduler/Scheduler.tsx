import React from "react";
import BTLoader from "components/Common/BTLoader";
import SchedulerOnboard from "./SchedulerOnboard";
import { useUser } from "graphql/hooks/user";

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
