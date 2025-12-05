import type { CSSProperties } from "react";

import { Color } from "@repo/theme";

// Limited color palette in rainbow order
export const COLLECTION_COLORS: Color[] = [
  Color.Red,
  Color.Orange,
  Color.Green,
  Color.Blue,
  Color.Purple,
  Color.Pink,
];

export function capitalizeColor(color: Color): string {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

export function getColorCSSVar(color: Color | null): string | undefined {
  return color ? `var(--${color}-300)` : undefined;
}

export function getColorStyle(color: Color | null): CSSProperties | undefined {
  return color ? { backgroundColor: getColorCSSVar(color) } : undefined;
}
