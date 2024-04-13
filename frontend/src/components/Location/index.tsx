import { useMemo } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";

import { buildings } from "@/lib/location";

import styles from "./Location.module.scss";

interface LocationProps {
  location: string;
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
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <p className={styles.trigger}>To be determined</p>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          asChild
          side="bottom"
          sideOffset={8}
          collisionPadding={8}
        >
          <div className={styles.content}>
            <Tooltip.Arrow className={styles.arrow} />
            <p className={styles.title}>Location</p>
            <p className={styles.description}>
              The location for this class has not been determined yet.
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
