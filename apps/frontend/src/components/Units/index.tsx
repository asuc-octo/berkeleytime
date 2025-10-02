import { ReactNode, useMemo } from "react";

import styles from "./Units.module.scss";

interface UnitsProps {
  unitsMin?: number;
  unitsMax?: number;
  children?: (units: string) => ReactNode;
}

export default function Units({ unitsMin, unitsMax, children }: UnitsProps) {
  const hasNumbers =
    typeof unitsMin === "number" && typeof unitsMax === "number";

  const units = useMemo(() => {
    if (!hasNumbers) return "";

    return unitsMax === unitsMin
      ? `${unitsMin} ${unitsMin === 1 ? "unit" : "units"}`
      : `${unitsMin} - ${unitsMax} units`;
  }, [hasNumbers, unitsMax, unitsMin]);

  if (children) return children(units);

  if (!hasNumbers) return null;

  return <p className={styles.root}>{units}</p>;
}
