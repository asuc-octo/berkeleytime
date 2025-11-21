import { MouseEvent, ReactNode } from "react";

import { Lock } from "iconoir-react";
import { Tooltip } from "radix-ui";
import { NavLink, NavLinkProps } from "react-router-dom";

import { MenuItem } from "@repo/theme";

export const RATINGS_REQUIRED_REVIEWS = 3;

export interface RatingsLockContext {
  userRatingsCount?: number;
  requiredRatingsCount?: number;
  requiresLogin?: boolean;
}

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

type RatingsTabLinkComponent = (props: RatingsTabLinkProps) => JSX.Element;

interface RatingsTabLinkStatics {
  shouldDisplay: (context?: RatingsLockContext) => boolean;
  isLocked: (context?: RatingsLockContext) => boolean;
  ratingsNeeded: (context?: RatingsLockContext) => number;
}

type RatingsTabLinkType = RatingsTabLinkComponent & RatingsTabLinkStatics;

const shouldDisplayRatingsTab = (context?: RatingsLockContext) => {
  void context;
  return true;
};

const getRequiredRatingsTarget = (context?: RatingsLockContext) =>
  context?.requiredRatingsCount ?? RATINGS_REQUIRED_REVIEWS;

const getRatingsNeeded = (context?: RatingsLockContext) => {
  if (!context) return 0;
  if (context.requiresLogin) {
    return getRequiredRatingsTarget(context);
  }
  if (typeof context.userRatingsCount !== "number") return 0;
  return Math.max(
    0,
    getRequiredRatingsTarget(context) - context.userRatingsCount
  );
};

export const isRatingsLocked = (context?: RatingsLockContext) =>
  context?.requiresLogin ? true : getRatingsNeeded(context) > 0;

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
    : `We still need ${ratingsNeededValue} ratings from you before showing everyone else's`;

  return (
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>{navLink}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          asChild
          side="bottom"
          sideOffset={8}
          collisionPadding={8}
        >
          <div className={classes.tooltipContent}>
            <Tooltip.Arrow className={classes.tooltipArrow} />
            {!dialog && <p className={classes.tooltipTitle}>Locked Content</p>}
            <p className={classes.tooltipDescription}>{tooltipDescription}</p>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
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
