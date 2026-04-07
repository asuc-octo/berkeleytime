export type ActivityScoreInput = {
  lastSeenAt: Date;
  createdAt: Date;
};

type FormulaFn = (user: ActivityScoreInput) => number;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const daysSince = (date: Date): number =>
  (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);

/**
 * Exponential decay.
 *
 * score = e^(−λ × days),  λ = ln(2) / halfLifeDays
 *
 * Score is 1.0 at 0 days, 0.5 at halfLifeDays, and asymptotically approaches
 * 0 for very old users. Never exactly reaches 0.
 */
export const exponentialDecay: FormulaFn = ({ lastSeenAt }) => {
  const HALF_LIFE_DAYS = 14;
  const lambda = Math.LN2 / HALF_LIFE_DAYS;
  const days = daysSince(lastSeenAt);
  return Math.exp(-lambda * days);
};

/**
 * Linear decay with a hard window.
 *
 * score = clamp(1 − days / windowDays, 0, 1)
 *
 * Score is 1.0 at 0 days and reaches exactly 0 at windowDays.
 */
export const linearDecay: FormulaFn = ({ lastSeenAt }) => {
  const WINDOW_DAYS = 30;
  const days = daysSince(lastSeenAt);
  return clamp(1 - days / WINDOW_DAYS, 0, 1);
};

/**
 * Tiered / step function.
 *
 * Maps recency buckets to fixed scores:
 *   < 7 days   → 1.0  (weekly active)
 *   7–30 days  → 0.6  (monthly active)
 *   30–90 days → 0.3  (infrequent)
 *   > 90 days  → 0.0  (churned)
 */
export const tiered: FormulaFn = ({ lastSeenAt }) => {
  const days = daysSince(lastSeenAt);
  if (days < 7) return 1.0;
  if (days < 30) return 0.6;
  if (days < 90) return 0.3;
  return 0.0;
};

/**
 * Sigmoid (soft threshold).
 *
 * score = 1 / (1 + e^(k × (days − midpoint)))
 *
 * Stays near 1.0 for recently active users, then drops sharply around
 * midpointDays. k controls how steep the drop-off is.
 */
export const sigmoid: FormulaFn = ({ lastSeenAt }) => {
  const MIDPOINT_DAYS = 21;
  const K = 0.3;
  const days = daysSince(lastSeenAt);
  return 1 / (1 + Math.exp(K * (days - MIDPOINT_DAYS)));
};

export type FormulaName =
  | "exponentialDecay"
  | "linearDecay"
  | "tiered"
  | "sigmoid";

export const FORMULA_MAP: Record<FormulaName, FormulaFn> = {
  exponentialDecay,
  linearDecay,
  tiered,
  sigmoid,
};

// Change this line to switch which formula the job uses.
export const ACTIVE_FORMULA_NAME: FormulaName = "exponentialDecay";
export const ACTIVE_FORMULA: FormulaFn = FORMULA_MAP[ACTIVE_FORMULA_NAME];
