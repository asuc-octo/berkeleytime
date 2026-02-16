import { MouseEvent, ReactElement, ReactNode } from "react";

import { Lock } from "iconoir-react";
import { NavLink, NavLinkProps } from "react-router-dom";

import { MenuItem, Tooltip } from "@repo/theme";

import {
  RatingsLockContext,
  getRatingsNeeded,
  isRatingsLocked,
  shouldDisplayRatingsTab,
} from "./locks.helpers";

interface RatingsTabClasses {
  badge: string;
  dot: string;
  tooltipArrow: string;
  tooltipContent: string;
  tooltipTitle: string;
  tooltipDescription: string;
}

interface RatingsTabLinkProps {
  to?: NavLinkProps["to"];
  dialog?: boolean;
  active?: boolean;
  onClick?: () => void;
  ratingsCount?: number | false;
  locked?: boolean;
  onLockedClick?: () => void;
  loginRequired?: boolean;
  ratingsNeededValue?: number;
  classes: RatingsTabClasses;
}

type RatingsTabLinkComponent = (props: RatingsTabLinkProps) => ReactElement;

interface RatingsTabLinkStatics {
  shouldDisplay: (context?: RatingsLockContext) => boolean;
  isLocked: (context?: RatingsLockContext) => boolean;
  ratingsNeeded: (context?: RatingsLockContext) => number;
}

type RatingsTabLinkType = RatingsTabLinkComponent & RatingsTabLinkStatics;

function RatingsTabLinkBase({
  to,
  dialog = false,
  active,
  onClick,
  ratingsCount,
  locked = isRatingsLocked(),
  onLockedClick,
  loginRequired = false,
  ratingsNeededValue = 0,
  classes,
}: RatingsTabLinkProps) {
  const badge = ratingsCount ? (
    <div className={classes.badge}>{ratingsCount}</div>
  ) : (
    <div className={classes.dot}></div>
  );

  const handleLockedClick = (event: MouseEvent<HTMLElement>) => {
    if (!locked) {
      onClick?.();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onLockedClick?.();
  };

  const renderMenuItem = (isActive = false): ReactNode => (
    <MenuItem active={active ?? isActive}>
      {locked && <Lock style={{ marginRight: 4 }} />}
      Ratings
      {badge}
    </MenuItem>
  );

  const tabTrigger = to ? (
    <NavLink
      to={to}
      onClick={handleLockedClick}
      aria-disabled={locked || undefined}
      tabIndex={locked ? -1 : undefined}
    >
      {dialog ? renderMenuItem() : ({ isActive }) => renderMenuItem(isActive)}
    </NavLink>
  ) : (
    <MenuItem
      active={active ?? false}
      aria-disabled={locked || undefined}
      onClick={(event: MouseEvent<HTMLElement>) => handleLockedClick(event)}
    >
      {locked && <Lock style={{ marginRight: 4 }} />}
      Ratings
      {badge}
    </MenuItem>
  );

  if (!locked) {
    return tabTrigger;
  }

  const tooltipDescription = loginRequired
    ? "Log in to view ratings from other students."
    : `Rate ${Math.max(ratingsNeededValue, 1)} classes to unlock all other ratings.`;

  return (
    <Tooltip
      trigger={tabTrigger}
      title={!dialog ? "Locked Content" : undefined}
      description={tooltipDescription}
    />
  );
}

export const RatingsTabLink: RatingsTabLinkType = Object.assign(
  RatingsTabLinkBase,
  {
    shouldDisplay: shouldDisplayRatingsTab,
    isLocked: isRatingsLocked,
    ratingsNeeded: getRatingsNeeded,
  }
);

export type { RatingsTabClasses };
