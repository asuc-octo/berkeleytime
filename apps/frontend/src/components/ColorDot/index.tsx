import { Color } from "@repo/theme";

import { getColorStyle } from "@/lib/colors";

import styles from "./ColorDot.module.scss";

export interface ColorDotProps {
  color: Color | null;
}

export function ColorDot({ color }: ColorDotProps) {
  if (color === null) {
    return <span className={styles.colorDotOutline} />;
  }

  return (
    <span className={styles.colorDot} style={getColorStyle(color)} />
  );
}

