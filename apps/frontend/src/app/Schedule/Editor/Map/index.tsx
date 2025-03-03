import { useEffect, useMemo, useRef, useState } from "react";

// @ts-expect-error - MapboxDirections does not provide types
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import { ArrowSeparateVertical, Walking, ZoomIn, ZoomOut } from "iconoir-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { Button, IconButton, useColorScheme, useTheme } from "@repo/theme";

import { ISection } from "@/lib/api";
import { buildings } from "@/lib/location";

import styles from "./Map.module.scss";

const TOKEN =
  "pk.eyJ1IjoibWF0aGh1bGsiLCJhIjoiY2t6bTFhcDU2M2prOTJwa3VwcTJ2d2dpMiJ9.WEJWEP_qrKGXkYOgbIsaGg";

const MAX_ZOOM = 18;
const MIN_ZOOM = 14;
const DEFAULT_ZOOM = 15.5;
// const OFFSET: [number, number] = [-156, 0];

mapboxgl.accessToken = TOKEN;

interface MapProps {
  selectedSections: ISection[];
}

export default function Map({ selectedSections }: MapProps) {
  const { theme } = useTheme();

  const scheme = useColorScheme();

  const currentTheme = useMemo(() => theme ?? scheme, [theme, scheme]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [directions, setDirections] = useState<MapboxDirections | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const waypoints = useMemo(
    () =>
      selectedSections
        .filter((section) => section.meetings[0].location)
        .map(({ meetings: [{ location }] }) => {
          const building = location!.split(" ").slice(0, -1).join(" ");
          return buildings[building].location;
        }),
    [selectedSections]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // let destructor: (() => void) | null = null;

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
      const directions = new MapboxDirections({
        styles: [
          {
            id: "directions-route-line-casing",
            type: "line",
            source: "directions",
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 4,
            },
            filter: [
              "all",
              ["in", "$type", "LineString"],
              ["in", "route", "selected"],
            ],
          },
        ],
        accessToken: TOKEN,
        unit: "imperial",
        profile: "mapbox/walking",
        controls: {
          inputs: false,
          instructions: false,
          profileSwitcher: false,
        },
        interactive: false,
        instructions: false,
      });

      map.addControl(directions);

      // @ts-expect-error - MapboxDirections does not provide types
      directions.on("route", ({ route }) => {
        console.log(route);

        for (let index = 0; index < route[0].legs.length; index++) {
          const { steps } = route[0].legs[index];

          const start = document.createElement("div");
          start.className = "marker";
          start.textContent = (index + 1).toLocaleString();

          /*const tooltip = document.createElement("div");
          tooltip.className = "tooltip";
          tooltip.textContent = "Stop";*/

          const originMarker = new mapboxgl.Marker(start)
            .setLngLat(steps[0].maneuver.location)
            .addTo(map);

          markersRef.current.push(originMarker);

          /*const showTooltip = () => {
            document.body.appendChild(tooltip);

            destructor = autoUpdate(
              start,
              tooltip,
              () => {
                computePosition(start, tooltip, {
                  placement: "top",
                  middleware: [
                    flip(),
                    offset(8),
                    shift({
                      padding: 8,
                      boundary: document.getElementById("boundary") as Element,
                    }),
                  ],
                }).then(({ x, y }) => {
                  Object.assign(tooltip.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                  });
                });
              },
              {
                animationFrame: true,
              }
            );
          };

          const hideTooltip = () => {
            tooltip.remove();

            destructor?.();
          };

          [
            ["mouseenter", showTooltip],
            ["mouseleave", hideTooltip],
            ["focus", showTooltip],
            ["blur", hideTooltip],
          ].forEach(([event, listener]) => {
            start.addEventListener(
              event as keyof HTMLElementEventMap,
              listener as () => void
            );
          });*/

          if (index !== route[0].legs.length - 1) continue;

          const end = document.createElement("div");
          end.className = "marker";
          end.textContent = (index + 2).toLocaleString();

          const destinationMarker = new mapboxgl.Marker(end)
            .setLngLat(steps[steps.length - 1].maneuver.location)
            .addTo(map);

          markersRef.current.push(destinationMarker);
        }

        map.jumpTo({ center: [-122.2592173, 37.8721508] });

        // Remove unnecessary layers
        map.removeLayer("directions-route-line");
        map.removeLayer("directions-waypoint-point-casing");
        map.removeLayer("directions-waypoint-point");
        map.removeLayer("directions-origin-point");
        map.removeLayer("directions-destination-point");
        map.removeLayer("directions-origin-label");
        map.removeLayer("directions-destination-label");
      });

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
          "line-color": "#3b82f6",
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
          "fill-color": "#3b82f6",
          "fill-opacity": 0.05,
        },
      });

      setDirections(directions);
    });

    map.on("zoomend", () => {
      setZoom(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
    };
  }, [currentTheme]);

  useEffect(() => {
    if (!directions) return;

    markersRef.current.forEach((marker) => marker.remove());

    const length = directions.getWaypoints().length;

    for (let index = 0; index < length; index++) {
      directions.removeWaypoint(index);
    }

    if (waypoints.length < 2) return;

    directions.setOrigin(waypoints[0]);
    directions.setDestination(waypoints[waypoints.length - 1]);

    for (let index = 1; index < waypoints.length - 1; index++) {
      directions.addWaypoint(index, waypoints[index]);
    }
  }, [waypoints, directions]);

  return (
    <div className={styles.root}>
      <div className={styles.toolBar}>
        <Button>
          <ArrowSeparateVertical />
          Monday
        </Button>
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
      </div>
      <div className={styles.container} ref={containerRef} />
      <div className={styles.sideBar}>
        <div className={styles.waypoint}>
          <div className={styles.number}>1</div>
          <div className={styles.text}>
            <p className={styles.label}>8:30 AM</p>
            <p className={styles.heading}>STAT 154</p>
            <p className={styles.description}>Dwinelle Hall 117</p>
          </div>
        </div>
        <div className={styles.leg}>
          <Walking />
          <div className={styles.value}>
            <span className={styles.distance}>5 min.</span> (0.5 mi.)
          </div>
        </div>
        <div className={styles.waypoint}>
          <div className={styles.number}>2</div>
          <div className={styles.text}>
            <p className={styles.label}>8:30 AM</p>
            <p className={styles.heading}>STAT 154</p>
            <p className={styles.description}>Dwinelle Hall 117</p>
          </div>
        </div>
        <div className={styles.leg}>
          <Walking />
          <div className={styles.value}>
            <span className={styles.distance}>5 min.</span> (0.5 mi.)
          </div>
        </div>
        <div className={styles.waypoint}>
          <div className={styles.number}>3</div>
          <div className={styles.text}>
            <p className={styles.label}>8:30 AM</p>
            <p className={styles.heading}>STAT 154</p>
            <p className={styles.description}>Dwinelle Hall 117</p>
          </div>
        </div>
      </div>
    </div>
  );
}
