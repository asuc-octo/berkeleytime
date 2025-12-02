import type { CSSProperties } from "react";

import { Color } from "@repo/theme";

import { CollectionColor } from "./generated/graphql";

// valid cast since CollectionColor values are a subset of Color values
export const COLLECTION_COLORS = Object.values(
  CollectionColor
) as unknown as Color[];

export function getRandomColor(): Color {
  return COLLECTION_COLORS[
    Math.floor(Math.random() * COLLECTION_COLORS.length)
  ];
}

export function capitalizeColor(color: Color): string {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

export function getColorStyle(color: Color | null): CSSProperties | undefined {
  return color ? { backgroundColor: `var(--${color}-300)` } : undefined;
}
