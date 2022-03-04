/**
 * Represents a unit for a class. This is the way it is because some classes can
 * have variable units
 */
export type Units = {
  lowerBound: number;
  upperBound: number;
};

/**
 * Value representing zero units
 */
export const ZERO_UNITS = { lowerBound: 0, upperBound: 0 };

/**
 * Adds two units
 */
export function addUnits(a: Units, b: Units): Units {
  return {
    lowerBound: a.lowerBound + b.lowerBound,
    upperBound: a.upperBound + b.upperBound,
  };
}

/**
 * Converts unit to a human-readable unit
 */
export function unitsToString(units: Units): string {
  if (units.lowerBound === units.upperBound) {
    return `${units.lowerBound}`;
  } else {
    return `${units.lowerBound}-${units.upperBound}`;
  }
}

/**
 * Parses a unit string
 */
export function parseUnits(string: string): Units {
  if (string.includes("-")) {
    const [lower, upper] = string.split("-");
    return {
      lowerBound: +lower,
      upperBound: +upper,
    };
  } else {
    const value = +string;
    return {
      lowerBound: value,
      upperBound: value,
    };
  }
}
