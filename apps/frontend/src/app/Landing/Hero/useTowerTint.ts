import { useMemo } from "react";

import { useSkyGradient } from "./useSkyGradient";

export interface TowerColors {
  light: string;
  moderate: string;
  bright: string;
  dark: string;
}

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
function averageColors(colors: string[]): [number, number, number] {
  const rgbs = colors.map(hexToRgb);
  const avg: [number, number, number] = [0, 0, 0];
  for (const rgb of rgbs) {
    avg[0] += rgb[0];
    avg[1] += rgb[1];
    avg[2] += rgb[2];
  }
  return [avg[0] / rgbs.length, avg[1] / rgbs.length, avg[2] / rgbs.length];
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
    const scale = Math.min(1, 0.4 + luminance * 1.2);
    offset = baseOffset * scale;
  } else {
    // Darkening: scale up for dark bases
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

// Calculate tower colors from gradient colors
export function calculateTowerColorsFromGradient(
  gradientColors: string[]
): TowerColors {
  const baseColor = averageColors(gradientColors);

  return {
    bright: adjustLuminance(baseColor, LUMINANCE_OFFSETS.bright),
    light: adjustLuminance(baseColor, LUMINANCE_OFFSETS.light),
    moderate: adjustLuminance(baseColor, LUMINANCE_OFFSETS.moderate),
    dark: adjustLuminance(baseColor, LUMINANCE_OFFSETS.dark),
  };
}

// Hook that syncs tower colors with sky gradient
export function useTowerColors(milliseconds: number): TowerColors {
  const { colors } = useSkyGradient(milliseconds);

  return useMemo(
    () => calculateTowerColorsFromGradient(colors),
    [colors]
  );
}
