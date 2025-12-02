import type { CSSProperties } from "react";

import { CollectionColor } from "./generated/graphql";

export const COLLECTION_COLORS = Object.values(
  CollectionColor
) as readonly CollectionColor[];

export function getRandomColor(): CollectionColor {
  return COLLECTION_COLORS[
    Math.floor(Math.random() * COLLECTION_COLORS.length)
  ];
}

export function capitalizeColor(color: string): string {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

export function getColorStyle(color: string | null): CSSProperties | undefined {
  return color ? { backgroundColor: `var(--${color}-300)` } : undefined;
}
