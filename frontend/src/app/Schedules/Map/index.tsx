import { useEffect, useMemo, useRef, useState } from "react";

import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom";
// @ts-expect-error - MapboxDirections does not provide types
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import {
  ArrowSeparateVertical,
  Position,
  Walking,
  ZoomIn,
  ZoomOut,
} from "iconoir-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import { buildings } from "@/lib/location";

import styles from "./Map.module.scss";

const TOKEN =
  "pk.eyJ1IjoibWF0aGh1bGsiLCJhIjoiY2t6bTFhcDU2M2prOTJwa3VwcTJ2d2dpMiJ9.WEJWEP_qrKGXkYOgbIsaGg";

const MAX_ZOOM = 18;
const MIN_ZOOM = 14;
const DEFAULT_ZOOM = 15.5;
const OFFSET: [number, number] = [-156, 0];

mapboxgl.accessToken = TOKEN;

interface MapProps {
  boundary: Element | null;
}

export default function Map({ boundary }: MapProps) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const waypoints = useMemo(() => {
    return Object.keys(buildings)
      .filter((key) => ["Haas Faculty Wing", "Pimentel", "Cory"].includes(key))
      .map((key) => buildings[key]);
  }, []);

  const handleClick = () => {
    // Calculate the center based on the markers and center the map
    const bounds = new mapboxgl.LngLatBounds();

    bounds.extend([-122.2592173, 37.8721508]);

    map?.fitBounds(bounds, {
      offset: OFFSET,
      zoom: DEFAULT_ZOOM,
    });
  };

  useEffect(() => {
    if (!boundary || !mapRef.current) return;

    let destructor: (() => void) | null = null;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mathhulk/clbznbvgs000314k8gtwa9q60",
      center: [-122.2592173, 37.8721508],
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    });

    const directions = new MapboxDirections({
      /*styles: [
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
      ],*/
      accessToken: TOKEN,
      unit: "imperial",
      profile: "mapbox/walking",
      /*controls: {
        inputs: false,
        instructions: false,
        profileSwitcher: false,
      },
      interactive: false,
      instructions: false,*/
    });

    // directions.setOrigin(waypoints[0].location);
    // directions.setDestination(waypoints[2].location);

    map.addControl(directions);

    // @ts-expect-error - MapboxDirections does not provide types
    directions.on("route", ({ route }) => {
      console.log(route);

      /*for (let index = 0; index < route[0].legs.length; index++) {
        const { steps } = route[0].legs[index];

        const start = document.createElement("div");
        start.className = "marker";
        start.textContent = (index + 1).toLocaleString();

        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.textContent = "Stop";

        new mapboxgl.Marker(start)
          .setLngLat(steps[0].maneuver.location)
          .addTo(map);

        const showTooltip = () => {
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
                  shift({ padding: 8, boundary }),
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
        });

        if (index !== route[0].legs.length - 1) continue;

        const end = document.createElement("div");
        end.className = "marker";
        end.textContent = (index + 2).toLocaleString();

        new mapboxgl.Marker(end)
          .setLngLat(steps[steps.length - 1].maneuver.location)
          .addTo(map);
      }

      map.panTo(route[0].legs[0].steps[0].maneuver.location, {
        offset: OFFSET,
      });

      // Remove unnecessary layers
      /*map.removeLayer("directions-route-line");
      map.removeLayer("directions-waypoint-point-casing");
      map.removeLayer("directions-waypoint-point");
      map.removeLayer("directions-origin-point");
      map.removeLayer("directions-destination-point");
      map.removeLayer("directions-origin-label");
      map.removeLayer("directions-destination-label");

      console.log(map.getStyle().layers);*/
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
    });

    map.on("zoomend", () => {
      setZoom(map.getZoom());
    });

    setMap(map);

    return () => {
      map.remove();
    };
  }, [boundary, waypoints]);

  return (
    <div className={styles.root}>
      <div className={styles.toolBar}>
        <Button secondary className={styles.button}>
          <ArrowSeparateVertical />
          Monday
        </Button>
        <IconButton disabled={zoom === MAX_ZOOM} onClick={() => map?.zoomIn()}>
          <ZoomIn />
        </IconButton>
        <IconButton disabled={zoom === MIN_ZOOM} onClick={() => map?.zoomOut()}>
          <ZoomOut />
        </IconButton>
        <IconButton onClick={() => handleClick()}>
          <Position />
        </IconButton>
      </div>
      <div className={styles.map} ref={mapRef} />
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
