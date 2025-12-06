import { useMemo } from "react";
import SunCalc from "suncalc";

// Berkeley coordinates
const BERKELEY_LAT = 37.8716;
const BERKELEY_LNG = -122.2727;

// Gradient color stops for each phase (matching _gradient.scss)
const GRADIENTS = [
  // Phase 0: deep night (midnight - astronomical dawn)
  ["#040911", "#070e1b", "#0b182b", "#13253c", "#1c3249", "#243a4c"],
  // Phase 1: pre-dawn (astronomical dawn - nautical dawn)
  ["#010104", "#0a0a12", "#1b1a1e", "#302822", "#4e2c0e", "#5e1801"],
  // Phase 2: sunrise (nautical dawn - golden hour end)
  ["#695371", "#9b6368", "#bc7161", "#ab5f53", "#944d47", "#8a4541"],
  // Phase 3: morning (golden hour end - mid-morning)
  ["#898989", "#a3948b", "#997c71", "#7b5d5b", "#5a464e", "#403743"],
  // Phase 4: midday (mid-morning - mid-afternoon)
  ["#50a7fd", "#5cb2fe", "#6bbdfe", "#79c8fe", "#85d1fe", "#8dd6fe"],
  // Phase 5: afternoon (mid-afternoon - golden hour start)
  ["#2b4850", "#4b6f7e", "#709da4", "#aebd9a", "#c8904d", "#4a3a30"],
  // Phase 6: sunset (golden hour - nautical dusk)
  ["#012254", "#02387b", "#1e59a6", "#6379bb", "#7b537f", "#253668"],
  // Phase 7: dusk (nautical dusk - midnight)
  ["#1c3a62", "#1e3e68", "#214470", "#244a7b", "#285184", "#2b558b"],
];

// Gradient stop positions (matching _gradient.scss)
const STOP_POSITIONS = [2, 31, 56, 75, 89, 99];

// Parse hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")}`;
}

// Interpolate between two colors
function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): string {
  return rgbToHex(
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t
  );
}

// Interpolate between two gradient arrays
function lerpGradient(g1: string[], g2: string[], t: number): string[] {
  return g1.map((color, i) => {
    const rgb1 = hexToRgb(color);
    const rgb2 = hexToRgb(g2[i]);
    return lerpColor(rgb1, rgb2, t);
  });
}

// Build CSS gradient string from colors
function buildGradientCSS(colors: string[]): string {
  const stops = colors
    .map((color, i) => `${color} ${STOP_POSITIONS[i]}%`)
    .join(", ");
  return `linear-gradient(to bottom, ${stops})`;
}

// Get time as fraction of day (0-1)
function getTimeOfDay(date: Date): number {
  return (
    (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()) /
    86400
  );
}

// Convert Date to fraction of day
function dateToFraction(date: Date, referenceDate: Date): number {
  const midnight = new Date(referenceDate);
  midnight.setHours(0, 0, 0, 0);
  return (date.getTime() - midnight.getTime()) / 86400000;
}

interface SunPhases {
  nightEnd: number; // astronomical dawn
  nauticalDawn: number;
  dawn: number; // civil dawn
  sunrise: number;
  sunriseEnd: number;
  goldenHourEnd: number;
  solarNoon: number;
  goldenHour: number;
  sunsetStart: number;
  sunset: number;
  dusk: number; // civil dusk
  nauticalDusk: number;
  night: number; // astronomical dusk
}

// Get sun phases as fractions of day (0-1)
function getSunPhases(date: Date): SunPhases {
  const times = SunCalc.getTimes(date, BERKELEY_LAT, BERKELEY_LNG);

  return {
    nightEnd: dateToFraction(times.nightEnd, date),
    nauticalDawn: dateToFraction(times.nauticalDawn, date),
    dawn: dateToFraction(times.dawn, date),
    sunrise: dateToFraction(times.sunrise, date),
    sunriseEnd: dateToFraction(times.sunriseEnd, date),
    goldenHourEnd: dateToFraction(times.goldenHourEnd, date),
    solarNoon: dateToFraction(times.solarNoon, date),
    goldenHour: dateToFraction(times.goldenHour, date),
    sunsetStart: dateToFraction(times.sunsetStart, date),
    sunset: dateToFraction(times.sunset, date),
    dusk: dateToFraction(times.dusk, date),
    nauticalDusk: dateToFraction(times.nauticalDusk, date),
    night: dateToFraction(times.night, date),
  };
}

// Calculate progress within a time range (0-1)
function getProgress(current: number, start: number, end: number): number {
  if (end <= start) {
    // Handle wrap around midnight
    if (current >= start) {
      return (current - start) / (1 - start + end);
    } else {
      return (1 - start + current) / (1 - start + end);
    }
  }
  return Math.max(0, Math.min(1, (current - start) / (end - start)));
}

export interface SkyGradientResult {
  gradient: string;
  colors: string[];
  phase: number;
  progress: number;
}

// Main hook: calculate sky gradient based on time
export function useSkyGradient(milliseconds: number): SkyGradientResult {
  return useMemo(() => {
    const date = new Date(milliseconds);
    const sun = getSunPhases(date);
    const now = getTimeOfDay(date);

    let phase: number;
    let progress: number;

    // Map current time to gradient phases based on sun position
    // Phase transitions happen smoothly between key sun events

    if (now < sun.nightEnd) {
      // Deep night (before astronomical dawn)
      phase = 0;
      // Progress from midnight to astronomical dawn
      progress = now / sun.nightEnd;
    } else if (now < sun.nauticalDawn) {
      // Pre-dawn (astronomical dawn → nautical dawn)
      phase = 1;
      progress = getProgress(now, sun.nightEnd, sun.nauticalDawn);
    } else if (now < sun.goldenHourEnd) {
      // Sunrise period (nautical dawn → end of golden hour)
      phase = 2;
      progress = getProgress(now, sun.nauticalDawn, sun.goldenHourEnd);
    } else if (now < sun.solarNoon - 0.05) {
      // Morning (golden hour end → approaching solar noon)
      phase = 3;
      progress = getProgress(now, sun.goldenHourEnd, sun.solarNoon - 0.05);
    } else if (now < sun.solarNoon + 0.05) {
      // Midday (around solar noon, ~2.4 hours window)
      phase = 4;
      progress = getProgress(now, sun.solarNoon - 0.05, sun.solarNoon + 0.05);
    } else if (now < sun.goldenHour) {
      // Afternoon (after midday → golden hour start)
      phase = 5;
      progress = getProgress(now, sun.solarNoon + 0.05, sun.goldenHour);
    } else if (now < sun.nauticalDusk) {
      // Sunset period (golden hour → nautical dusk)
      phase = 6;
      progress = getProgress(now, sun.goldenHour, sun.nauticalDusk);
    } else if (now < sun.night) {
      // Dusk (nautical dusk → astronomical dusk)
      phase = 7;
      progress = getProgress(now, sun.nauticalDusk, sun.night);
    } else {
      // Deep night (after astronomical dusk)
      phase = 0;
      // Progress from astronomical dusk to midnight
      progress = 0.5 + getProgress(now, sun.night, 1) * 0.5;
    }

    // Interpolate between current phase and next phase
    const nextPhase = (phase + 1) % 8;
    const colors = lerpGradient(
      GRADIENTS[phase],
      GRADIENTS[nextPhase],
      progress
    );
    const gradient = buildGradientCSS(colors);

    return { gradient, colors, phase, progress };
  }, [milliseconds]);
}

// Export for tower color calculation
export { GRADIENTS, hexToRgb };
