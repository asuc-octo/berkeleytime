import { useMemo } from "react";

import { buildings } from "@/lib/location";

import styles from "./Location.module.scss";
import { LocationHoverCard } from "./LocationHoverCard";

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

  if (!building?.location || !building?.link || !room) {
    return <p className={styles.placeholder}>To be determined</p>;
  }

  return (
    <LocationHoverCard
      buildingName={building.name}
      room={room}
      link={building.link}
      coordinates={building.location}
    >
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={building.link}
        className={styles.root}
      >
        {building.name + " " + room}
      </a>
    </LocationHoverCard>
  );
}
