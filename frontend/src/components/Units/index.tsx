import { ReactNode, useMemo } from "react";

import styles from "./Units.module.scss";

interface UnitsProps {
  unitsMin: number;
  unitsMax: number;
  children?: (units: string) => ReactNode;
}

export default function Units({ unitsMin, unitsMax, children }: UnitsProps) {
  const units = useMemo(() => {
    return unitsMax === unitsMin
      ? `${unitsMin} ${unitsMin === 1 ? "unit" : "units"}`
      : `${unitsMin} - ${unitsMax} units`;
  }, [unitsMax, unitsMin]);

  return children ? children(units) : <p className={styles.root}>{units}</p>;
}
