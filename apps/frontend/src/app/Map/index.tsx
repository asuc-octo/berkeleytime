import { useEffect, useMemo, useRef, useState } from "react";

import { Position, ZoomIn, ZoomOut } from "iconoir-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { IconButton, usePrefersColorScheme, useTheme } from "@repo/theme";

import { buildings } from "@/lib/location";

import styles from "./Map.module.scss";

const TOKEN =
  "pk.eyJ1IjoibWF0aGh1bGsiLCJhIjoiY2t6bTFhcDU2M2prOTJwa3VwcTJ2d2dpMiJ9.WEJWEP_qrKGXkYOgbIsaGg";

const MAX_ZOOM = 18;
const MIN_ZOOM = 14;
const DEFAULT_ZOOM = 15.5;
// const OFFSET: [number, number] = [-156, 0];

mapboxgl.accessToken = TOKEN;

export default function Map() {
  const { theme } = useTheme();

  const scheme = usePrefersColorScheme();

  const currentTheme = useMemo(() => theme ?? scheme, [theme, scheme]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style:
        currentTheme === "dark"
          ? "mapbox://styles/mathhulk/clvblbtkd005k01rd1n28b2xt"
          : "mapbox://styles/mathhulk/clbznbvgs000314k8gtwa9q60",
      center: [-122.2592173, 37.8721508],
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    });

    map.on("load", async () => {
      map.addSource("campus", {
        type: "geojson",
        data: "/geojson/campus.geojson",
      });

      map.addLayer({
        id: "campus-fill",
        type: "line",
        source: "campus",
        layout: {},
        paint: {
          "line-width": 1,
          "line-color": "var(--blue-500)",
          "line-opacity": 0.5,
          "line-dasharray": [2, 2],
        },
      });

      map.addLayer({
        id: "campus-line",
        type: "fill",
        source: "campus",
        layout: {},
        paint: {
          "fill-color": "var(--blue-500)",
          "fill-opacity": 0.05,
        },
      });

      for (const building of Object.values(buildings)) {
        if (!building.location) continue;

        // Create a marker for each building
        const el = document.createElement("div");
        el.className = styles.marker;
        el.innerText = building.name[0].toUpperCase();

        // Add marker to map
        new mapboxgl.Marker(el).setLngLat(building.location).addTo(map);
      }
    });

    map.on("zoomend", () => {
      setZoom(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
    };
  }, [currentTheme]);

  return (
    <div className={styles.root}>
      <div className={styles.menu}>
        <IconButton
          disabled={zoom === MAX_ZOOM}
          onClick={() => mapRef.current?.zoomIn()}
        >
          <ZoomIn />
        </IconButton>
        <IconButton
          disabled={zoom === MIN_ZOOM}
          onClick={() => mapRef.current?.zoomOut()}
        >
          <ZoomOut />
        </IconButton>
        <IconButton
          disabled={zoom === MAX_ZOOM}
          onClick={() => mapRef.current?.zoomIn()}
        >
          <Position />
        </IconButton>
      </div>
      <div className={styles.container} ref={containerRef} />
      <div className={styles.overlay}>
        <div className={styles.panel}></div>
      </div>
    </div>
  );
}
