import { useMemo } from "react";

// Gradient color stops (matching _gradient.scss)
const GRADIENTS = [
  // gradient-one (deep night)
  ["#040911", "#070e1b", "#0b182b", "#13253c", "#1c3249", "#243a4c"],
  // gradient-two (pre-dawn)
  ["#010104", "#0a0a12", "#1b1a1e", "#302822", "#4e2c0e", "#5e1801"],
  // gradient-three (sunrise)
  ["#695371", "#9b6368", "#bc7161", "#ab5f53", "#944d47", "#8a4541"],
  // gradient-four (morning)
  ["#898989", "#a3948b", "#997c71", "#7b5d5b", "#5a464e", "#403743"],
  // gradient-five (midday) - neutral, no tint
  ["#50a7fd", "#5cb2fe", "#6bbdfe", "#79c8fe", "#85d1fe", "#8dd6fe"],
  // gradient-six (afternoon)
  ["#2b4850", "#4b6f7e", "#709da4", "#aebd9a", "#c8904d", "#4a3a30"],
  // gradient-seven (sunset)
  ["#012254", "#02387b", "#1e59a6", "#6379bb", "#7b537f", "#253668"],
  // gradient-eight (dusk)
  ["#1c3a62", "#1e3e68", "#214470", "#244a7b", "#285184", "#2b558b"],
];

// Animation timing: 30s cycle, 8 phases
const CYCLE_DURATION = 30000; // ms

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

// Average all color stops in a gradient
function averageGradient(stops: string[]): [number, number, number] {
  const rgbs = stops.map(hexToRgb);
  const avg: [number, number, number] = [0, 0, 0];
  for (const rgb of rgbs) {
    avg[0] += rgb[0];
    avg[1] += rgb[1];
    avg[2] += rgb[2];
  }
  return [avg[0] / rgbs.length, avg[1] / rgbs.length, avg[2] / rgbs.length];
}

// Blend two colors
function blendColors(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ];
}

// Get current tint based on animation progress
function getCurrentTint(progress: number): [number, number, number] {
  // Map progress (0-1) to gradient phases
  // The animation has complex layering, simplified here to 8 equal phases
  const phase = progress * 8;
  const currentPhase = Math.floor(phase) % 8;
  const nextPhase = (currentPhase + 1) % 8;
  const t = phase - Math.floor(phase);

  const currentAvg = averageGradient(GRADIENTS[currentPhase]);
  const nextAvg = averageGradient(GRADIENTS[nextPhase]);

  return blendColors(currentAvg, nextAvg, t);
}

export interface TowerColors {
  light: string;
  moderate: string;
  bright: string;
  dark: string;
}

// Calculate perceived luminance (0-1)
function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Adjust color with adaptive offsets based on base luminance
// Dark bases get smaller adjustments to avoid extreme contrast
function adjustLuminance(
  color: [number, number, number],
  baseOffset: number
): string {
  const [r, g, b] = color;
  const luminance = getLuminance(r, g, b);

  // Scale offset based on luminance:
  // - Dark colors (low luminance): reduce brightening, increase darkening range
  // - Bright colors (high luminance): normal offsets
  let offset = baseOffset;
  if (baseOffset > 0) {
    // Brightening: scale down for dark bases to avoid harsh contrast
    // At luminance 0.1, use 40% of the offset; at luminance 0.5+, use full offset
    const scale = Math.min(1, 0.4 + luminance * 1.2);
    offset = baseOffset * scale;
  } else {
    // Darkening: scale up for dark bases (more room to work with relatively)
    // This keeps dark variations visible even on dark bases
    const scale = Math.min(1, 0.6 + luminance * 0.8);
    offset = baseOffset * scale;
  }

  if (offset >= 0) {
    // Brighten: move toward white
    return rgbToHex(
      r + (255 - r) * offset,
      g + (255 - g) * offset,
      b + (255 - b) * offset
    );
  } else {
    // Darken: move toward black
    const factor = 1 + offset;
    return rgbToHex(r * factor, g * factor, b * factor);
  }
}

// Base offsets (will be scaled by luminance)
const LUMINANCE_OFFSETS = {
  bright: 0.55,
  light: 0.28,
  moderate: 0,
  dark: -0.35,
};

export function useTowerTint(animationStartTime: number): TowerColors {
  return useMemo(() => {
    const elapsed = Date.now() - animationStartTime;
    const progress = (elapsed % CYCLE_DURATION) / CYCLE_DURATION;
    const baseColor = getCurrentTint(progress);

    return {
      bright: adjustLuminance(baseColor, LUMINANCE_OFFSETS.bright),
      light: adjustLuminance(baseColor, LUMINANCE_OFFSETS.light),
      moderate: adjustLuminance(baseColor, LUMINANCE_OFFSETS.moderate),
      dark: adjustLuminance(baseColor, LUMINANCE_OFFSETS.dark),
    };
  }, [animationStartTime]);
}

// For continuous updates, use this with a timer
export function calculateTowerColors(elapsedMs: number): TowerColors {
  const progress = (elapsedMs % CYCLE_DURATION) / CYCLE_DURATION;
  const baseColor = getCurrentTint(progress);

  return {
    bright: adjustLuminance(baseColor, LUMINANCE_OFFSETS.bright),
    light: adjustLuminance(baseColor, LUMINANCE_OFFSETS.light),
    moderate: adjustLuminance(baseColor, LUMINANCE_OFFSETS.moderate),
    dark: adjustLuminance(baseColor, LUMINANCE_OFFSETS.dark),
  };
}
