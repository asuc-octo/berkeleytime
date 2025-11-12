import { useMemo } from "react";

import { buildings } from "@/lib/location";

import styles from "./Location.module.scss";

interface LocationProps {
  location?: string | null;
}

export default function Location({ location }: LocationProps) {
  const building = useMemo(() => {
    if (!location) return;

    const building = location.split(" ").slice(0, -1).join(" ");

    return buildings[building];
  }, [location]);

  const room = useMemo(() => {
    if (!location) return;

    return location.split(" ").pop();
  }, [location]);

  return building?.location && building?.link && room ? (
    <a target="_blank" href={building.link} className={styles.root}>
      {building.name + " " + room}
    </a>
  ) : (
    <p className={styles.placeholder}>To be determined</p>
  );
}
