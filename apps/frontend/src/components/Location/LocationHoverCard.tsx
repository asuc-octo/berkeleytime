import { useCallback, useRef } from "react";

import { ArrowRight } from "iconoir-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { HoverCard } from "radix-ui";

import { useIsDarkMode } from "@repo/theme";

import styles from "./LocationHoverCard.module.scss";

interface LocationHoverCardProps {
  link?: string;
  coordinates?: [number, number];
  children: React.ReactNode;
}

export function LocationHoverCard({
  link,
  coordinates,
  children,
}: LocationHoverCardProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const isDarkMode = useIsDarkMode();

  const mapContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Cleanup previous map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Initialize new map when container mounts
      if (node) {
        const center = coordinates ?? [-122.258, 37.872];

        // Map colors are hardcoded and must be manually updated to match styling changes
        const bgColor = isDarkMode ? "#18181b" : "#ffffff"; // zinc-900 / white
        const buildingColor = isDarkMode ? "#27272a" : "#e5e5e5"; // zinc-800 / neutral-200
        const buildingOutline = isDarkMode ? "#3f3f46" : "#d4d4d4"; // zinc-700 / neutral-300
        const roadColor = isDarkMode ? "#18181b" : "#ffffff"; // zinc-900 / white
        const roadOutline = isDarkMode ? "#3f3f46" : "#d4d4d4"; // zinc-700 / neutral-300
        const textColor = isDarkMode ? "#a1a1aa" : "#525252"; // zinc-400 / neutral-600

        const map = new maplibregl.Map({
          container: node,
          style: {
            version: 8,
            sources: {
              openmaptiles: {
                type: "vector",
                url: "https://tiles.openfreemap.org/planet",
              },
            },
            layers: [
              {
                id: "background",
                type: "background",
                paint: { "background-color": bgColor },
              },
              {
                id: "roads-outline",
                type: "line",
                source: "openmaptiles",
                "source-layer": "transportation",
                paint: {
                  "line-color": roadOutline,
                  "line-width": 4,
                },
              },
              {
                id: "roads",
                type: "line",
                source: "openmaptiles",
                "source-layer": "transportation",
                paint: {
                  "line-color": roadColor,
                  "line-width": 2,
                },
              },
              {
                id: "buildings",
                type: "fill",
                source: "openmaptiles",
                "source-layer": "building",
                paint: {
                  "fill-color": buildingColor,
                  "fill-outline-color": buildingOutline,
                },
              },
              {
                id: "place-labels",
                type: "symbol",
                source: "openmaptiles",
                "source-layer": "poi",
                layout: {
                  "text-field": ["get", "name"],
                  "text-size": 10,
                  "text-anchor": "top",
                },
                paint: {
                  "text-color": textColor,
                  "text-halo-color": bgColor,
                  "text-halo-width": 1,
                },
              },
            ],
          },
          center: center,
          zoom: 15.5,
          attributionControl: false,
        });

        if (coordinates) {
          new maplibregl.Marker({ color: "#3b82f6" })
            .setLngLat(coordinates)
            .addTo(map);
        }

        map.addControl(
          new maplibregl.AttributionControl({ compact: true }),
          "bottom-right"
        );

        mapRef.current = map;
      }
    },
    [coordinates, isDarkMode]
  );

  return (
    <HoverCard.Root openDelay={200} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <span className={styles.trigger}>{children}</span>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="bottom"
          align="start"
          sideOffset={8}
          className={styles.card}
        >
          <div className={styles.header}>
            <span>Class Location</span>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.headerLink}
              >
                Google Maps
                <ArrowRight width={12} height={12} />
              </a>
            )}
          </div>
          <div ref={mapContainerRef} className={styles.mapContainer} />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
