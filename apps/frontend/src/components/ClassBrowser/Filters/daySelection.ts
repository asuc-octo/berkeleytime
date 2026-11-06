import { Day, EMPTY_DAYS } from "../browser";

export const daysToSelectedFlags = (days: Day[]): boolean[] =>
  EMPTY_DAYS.map((_, index) => days.includes(String(index) as Day));

export const selectedFlagsToDays = (flags: boolean[]): Day[] =>
  flags.reduce((acc: Day[], isSelected, index) => {
    if (isSelected) acc.push(String(index) as Day);
    return acc;
  }, []);
