import { MouseEvent, ReactNode } from "react";

import { Lock } from "iconoir-react";
import { Tooltip } from "radix-ui";
import { NavLink, NavLinkProps } from "react-router-dom";

import { MenuItem } from "@repo/theme";

const RATINGS_LOCK_ENABLED = true;

export interface RatingsLockContext {
  user?: unknown;
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
  classes: RatingsTabClasses;
}

type RatingsTabLinkComponent = (props: RatingsTabLinkProps) => JSX.Element;

interface RatingsTabLinkStatics {
  shouldDisplay: (context?: RatingsLockContext) => boolean;
  isLocked: (context?: RatingsLockContext) => boolean;
}

type RatingsTabLinkType = RatingsTabLinkComponent & RatingsTabLinkStatics;

const shouldDisplayRatingsTab = (context?: RatingsLockContext) => {
  void context;
  return true;
};

export const isRatingsLocked = (context?: RatingsLockContext) => {
  void context;
  return RATINGS_LOCK_ENABLED;
};

function RatingsTabLinkBase({
  to,
  dialog = false,
  ratingsCount,
  locked = isRatingsLocked(),
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
  };

  const renderMenuItem = (isActive = false): ReactNode => (
    <MenuItem {...(dialog ? { styl: true } : { active: isActive })}>
      {locked && <Lock />}
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

  const tooltipDescription =
    "Click and add your experience to view ratings others have made";

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
  }
);

export type { RatingsTabClasses };
