const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

/**
 * Converts numerical day of the week to day. e.g. 0 => Sunday.
 */
export function dayToString(day: number): string {
    return DAY_NAMES[day];
}

/**
 * Converts a 'time' e.g. 13 into a time "1 PM"
 */
export function timeToHourString(time: number): string {
    const floorModTime = ((time % 24) + 24) % 24

    if (time <= 12) {
        return `${floorModTime}am`;
    } else {
        return `${floorModTime % 12}pm`;
    }
}