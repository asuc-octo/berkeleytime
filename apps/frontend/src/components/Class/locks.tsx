import { ReactNode } from "react";

import { Lock } from "iconoir-react";
import { Tooltip } from "radix-ui";
import { NavLink, NavLinkProps } from "react-router-dom";

import { MenuItem } from "@repo/theme";

import styles from "./Class.module.scss";

const RATINGS_LOCK_ENABLED = true;

export interface RatingsLockContext {
  user?: unknown;
}

export const shouldDisplayRatingsTab = (_?: RatingsLockContext) => true;

export const isRatingsLocked = (_?: RatingsLockContext) =>
  RATINGS_LOCK_ENABLED;

interface RatingsTabLinkProps {
  to: NavLinkProps["to"];
  dialog?: boolean;
  ratingsCount?: number | false;
  locked?: boolean;
}

export function RatingsTabLink({
  to,
  dialog = false,
  ratingsCount,
  locked = isRatingsLocked(),
}: RatingsTabLinkProps) {
  const badge = ratingsCount ? (
    <div className={styles.badge}>{ratingsCount}</div>
  ) : (
    <div className={styles.dot}></div>
  );

  const renderMenuItem = (isActive = false): ReactNode => (
    <MenuItem {...(dialog ? { styl: true } : { active: isActive })}>
      {locked && <Lock />}
      Ratings
      {badge}
    </MenuItem>
  );

  const navLink = (
    <NavLink to={to}>
      {dialog
        ? renderMenuItem()
        : ({ isActive }) => renderMenuItem(isActive)}
    </NavLink>
  );

  if (!locked) {
    return navLink;
  }

  const tooltipDescription = dialog
    ? "Add your experience to unlock ratings others have made"
    : "Add your experience to view ratings others have made";

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
          <div className={styles.tooltipContent}>
            <Tooltip.Arrow className={styles.tooltipArrow} />
            {!dialog && (
              <p className={styles.tooltipTitle}>Locked Content</p>
            )}
            <p className={styles.tooltipDescription}>{tooltipDescription}</p>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
