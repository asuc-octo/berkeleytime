import { MouseEvent, ReactElement, ReactNode } from "react";

import { Lock } from "iconoir-react";
import { NavLink, NavLinkProps } from "react-router-dom";

import { MenuItem } from "@repo/theme";

import { CatalogTooltip } from "@/components/CatalogTooltip";

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
  to: NavLinkProps["to"];
  dialog?: boolean;
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

  const handleLockedClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!locked) return;
    event.preventDefault();
    event.stopPropagation();
    onLockedClick?.();
  };

  const renderMenuItem = (isActive = false): ReactNode => (
    <MenuItem {...(dialog ? { styl: true } : { active: isActive })}>
      {locked && <Lock style={{ marginRight: 4 }} />}
      Ratings
      {badge}
    </MenuItem>
  );

  const navLink = (
    <NavLink
      to={to}
      onClick={locked ? handleLockedClick : undefined}
      aria-disabled={locked || undefined}
      tabIndex={locked ? -1 : undefined}
    >
      {dialog ? renderMenuItem() : ({ isActive }) => renderMenuItem(isActive)}
    </NavLink>
  );

  if (!locked) {
    return navLink;
  }

  const tooltipDescription = loginRequired
    ? "Log in to view ratings from other students."
    : `Share ${ratingsNeededValue} class rating${ratingsNeededValue !== 1 ? "s" : ""} to unlock everyone else's`;

  return (
    <CatalogTooltip
      trigger={navLink}
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
