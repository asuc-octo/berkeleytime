import { useMemo } from "react";

import styles from "./Units.module.scss";

interface UnitsProps {
  unitsMin: number;
  unitsMax: number;
}

export default function Units({ unitsMin, unitsMax }: UnitsProps) {
  const units = useMemo(() => {
    return unitsMax === unitsMin
      ? `${unitsMin} ${unitsMin === 1 ? "unit" : "units"}`
      : `${unitsMin} - ${unitsMax} units`;
  }, [unitsMax, unitsMin]);

  return <p className={styles.root}>{units}</p>;
}
