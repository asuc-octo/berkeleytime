import { USER_REQUIRED_RATINGS_TO_UNLOCK } from "@repo/shared";

export interface RatingsLockContext {
  userRatingsCount?: number;
  requiredRatingsCount?: number;
  requiresLogin?: boolean;
}

export const shouldDisplayRatingsTab = (context?: RatingsLockContext) => {
  void context;
  return true;
};

export const getRequiredRatingsTarget = (context?: RatingsLockContext) =>
  context?.requiredRatingsCount ?? USER_REQUIRED_RATINGS_TO_UNLOCK;

export const getRatingsNeeded = (context?: RatingsLockContext) => {
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
