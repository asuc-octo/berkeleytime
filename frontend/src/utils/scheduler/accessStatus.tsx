import React from "react";

import { ReactComponent as Lock } from "../../assets/svg/profile/lock.svg";
import { ReactComponent as World } from "../../assets/svg/profile/world.svg";

export const ACCESS_STATUSES = {
  private: {
    icon: <Lock />,
    name: "Just Me",
    description: "Only you can access your schedule.",
  },
  public: {
    icon: <World />,
    name: "With the Link",
    description: "Anyone with the link can access your schedule.",
  },
};

export type AccessStatus = keyof typeof ACCESS_STATUSES;
