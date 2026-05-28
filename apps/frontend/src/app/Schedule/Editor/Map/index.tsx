import { useEffect, useMemo, useRef, useState } from "react";

import type { FeatureCollection, Point } from "geojson";
import { ArrowUpRight, Walking, ZoomIn, ZoomOut } from "iconoir-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { IconButton, MenuItem, useColorScheme, useTheme } from "@repo/theme";

import { buildings, findBuildingForLocation } from "@/lib/location";

import { SectionColor } from "../../schedule";
import styles from "./Map.module.scss";

const MAX_ZOOM = 18;
const MIN_ZOOM = 14;
const DEFAULT_ZOOM = 15.5;
const CAMPUS_CENTER: [number, number] = [-122.2592173, 37.8721508];
const WALKING_ROUTE_ENDPOINT =
  "https://routing.openstreetmap.de/routed-foot/route/v1/foot";

type MapMode = "minimal" | "satellite";

interface BerkeleyMapLabel {
  coordinates: [number, number];
  name: string;
  priority?: number;
}

const MAP_MODE_OPTIONS: { label: string; value: MapMode }[] = [
  { label: "Minimal", value: "minimal" },
  { label: "Satellite", value: "satellite" },
];

const ADDITIONAL_BERKELEY_LABELS: BerkeleyMapLabel[] = [
  {
    coordinates: [-122.2592358273592, 37.8722145126222],
    name: "Morrison Library",
    priority: 2,
  },
  {
    coordinates: [-122.26220645353504, 37.87142462552724],
    name: "Bioscience, Natural Resources & Public Health Library",
  },
  {
    coordinates: [-122.25825, 37.87533],
    name: "Kresge Engineering Library",
  },
  {
    coordinates: [-122.25534011894594, 37.872593339541446],
    name: "Chemistry & Chemical Engineering Library",
  },
  {
    coordinates: [-122.25967790769536, 37.87409189531322],
    name: "Earth Sciences & Map Library",
  },
  {
    coordinates: [-122.25489197607627, 37.87074044380782],
    name: "Environmental Design Library",
  },
  {
    coordinates: [-122.25759413529791, 37.873621559931614],
    name: "Mathematics Statistics Library",
  },
  {
    coordinates: [-122.25682010086159, 37.872480670347336],
    name: "Physics-Astronomy Library",
  },
  {
    coordinates: [-122.25401475499672, 37.86950825416665],
    name: "Law Library",
  },
  {
    coordinates: [-122.25882193535269, 37.87602971606913],
    name: "Jacobs Institute for Design Innovation",
    priority: 2,
  },
  {
    coordinates: [-122.25831352863513, 37.87503515928838],
    name: "CITRIS Invention Lab",
    priority: 2,
  },
  {
    coordinates: [-122.26083662991704, 37.872543936658765],
    name: "Moffitt Makerspace",
    priority: 2,
  },
  {
    coordinates: [-122.257886, 37.875098],
    name: "Bechtel Engineering Center",
  },
  {
    coordinates: [-122.257814, 37.872065],
    name: "Sather Tower",
    priority: 2,
  },
  {
    coordinates: [-122.254609, 37.873594],
    name: "Hearst Greek Theatre",
  },
  {
    coordinates: [-122.26033260383534, 37.86955061087345],
    name: "Martin Luther King Jr. Student Union",
  },
];

const BERKELEY_CUSTOM_LABELS = Array.from(
  new Map(
    [
      ...Object.values(buildings).flatMap((building) =>
        building.location && building.name !== "Off campus"
          ? [
              {
                coordinates: building.location,
                name: building.name,
                priority: 1,
              },
            ]
          : []
      ),
      ...ADDITIONAL_BERKELEY_LABELS,
    ].map((label) => [label.name, label])
  ).values()
);

const BERKELEY_AFFILIATED_LABEL_NAMES = Array.from(
  new Set([
    ...BERKELEY_CUSTOM_LABELS.map((label) => label.name),
    "Berkeley Art Museum and Pacific Film Archive",
    "C. V. Starr East Asian Library",
    "California Hall",
    "Campanile",
    "Doe Memorial Library",
    "Engineering Library",
    "Greek Theatre",
    "Haas School of Business",
    "International House",
    "Martin Luther King Jr. Student Union",
    "Music Library",
    "The Bancroft Library",
    "UC Berkeley School of Law",
    "University of California, Berkeley",
    "UC Berkeley",
  ])
);

const BERKELEY_LABEL_KEYWORDS = [
  "berkeley",
  "campanile",
  "doe",
  "library",
  "maker",
  "makerspace",
  "invention lab",
  "student union",
  "hall",
  "center",
  "institute",
  "school",
  "college",
  "museum",
  "gym",
  "field",
  "lab",
  "laboratory",
  "auditorium",
  "theatre",
  "theater",
];

const BERKELEY_LABEL_GEOJSON: FeatureCollection<
  Point,
  { name: string; priority: number }
> = {
  features: BERKELEY_CUSTOM_LABELS.map((label) => ({
    geometry: {
      coordinates: label.coordinates,
      type: "Point",
    },
    properties: {
      name: label.name,
      priority: label.priority ?? 1,
    },
    type: "Feature",
  })),
  type: "FeatureCollection",
};

const DAYS = [
  { index: 0, label: "Monday", short: "M" },
  { index: 1, label: "Tuesday", short: "Tu" },
  { index: 2, label: "Wednesday", short: "W" },
  { index: 3, label: "Thursday", short: "Th" },
  { index: 4, label: "Friday", short: "F" },
  { index: 5, label: "Saturday", short: "Sa" },
  { index: 6, label: "Sunday", short: "Su" },
];

const getBaseMapStyle = (
  currentTheme: string,
  mapMode: MapMode
): maplibregl.StyleSpecification => {
  const isDark = currentTheme === "dark";
  const isSatellite = mapMode === "satellite";
  const bgColor = isDark ? "#18181b" : "#ffffff";
  const buildingColor = isDark ? "#27272a" : "#e2e8f0";
  const buildingOutline = isDark ? "#3f3f46" : "#cbd5e1";
  const roadColor = isSatellite ? "rgba(255, 255, 255, 0.56)" : bgColor;
  const roadOutline = isSatellite
    ? "rgba(15, 23, 42, 0.65)"
    : isDark
      ? "#3f3f46"
      : "#d4d4d4";
  const satelliteLabelColor = "#003262";
  const satelliteLabelHalo = "#fff9f0";
  const satelliteTextFont = ["Noto Sans Bold"];
  const textColor = isSatellite
    ? satelliteLabelColor
    : isDark
      ? "#f8fafc"
      : "#0f172a";
  const textHalo = isSatellite
    ? satelliteLabelHalo
    : isDark
      ? "rgba(3, 7, 18, 0.88)"
      : "rgba(255, 255, 255, 0.94)";
  const academicTextColor = isSatellite
    ? satelliteLabelColor
    : isDark
      ? "#ffd166"
      : "#001f4e";
  const academicTextHalo = isSatellite
    ? satelliteLabelHalo
    : isDark
      ? "rgba(3, 7, 18, 0.98)"
      : "rgba(255, 255, 255, 0.98)";
  const standardLabelSize = isSatellite ? 12 : 12;
  const campusLabelSize = isSatellite ? 13.5 : 13.25;
  const standardHaloWidth = isSatellite ? 2.1 : 1.35;
  const campusHaloWidth = isSatellite ? 2.4 : 1.75;
  const customLabelSize = isSatellite ? [12.25, 14, 16] : [12, 13.5, 15.5];
  const labelName = ["coalesce", ["get", "name"], ""];
  const lowerLabelName = ["downcase", labelName];
  const exactBerkeleyLabel = [
    "in",
    labelName,
    ["literal", BERKELEY_AFFILIATED_LABEL_NAMES],
  ];
  const keywordBerkeleyLabel = [
    "any",
    ...BERKELEY_LABEL_KEYWORDS.map((keyword) => [
      ">=",
      ["index-of", keyword, lowerLabelName],
      0,
    ]),
  ];
  const berkeleyLabel = ["any", exactBerkeleyLabel, keywordBerkeleyLabel];

  return {
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    layers: [
      {
        id: "background",
        paint: { "background-color": bgColor },
        type: "background",
      },
      ...(isSatellite
        ? [
            {
              id: "satellite",
              paint: {
                "raster-opacity": 0.86,
              },
              source: "satellite",
              type: "raster" as const,
            },
          ]
        : [
            {
              id: "buildings",
              paint: {
                "fill-color": buildingColor,
                "fill-outline-color": buildingOutline,
              },
              source: "openmaptiles",
              "source-layer": "building",
              type: "fill" as const,
            },
          ]),
      {
        filter: ["==", ["get", "class"], "path"],
        id: "paths-outline",
        paint: {
          "line-color": isSatellite ? "rgba(15, 23, 42, 0.72)" : roadOutline,
          "line-width": 4,
        },
        source: "openmaptiles",
        "source-layer": "transportation",
        type: "line",
      },
      {
        id: "roads-outline",
        paint: {
          "line-color": roadOutline,
          "line-width": 4,
        },
        source: "openmaptiles",
        "source-layer": "transportation",
        type: "line",
      },
      {
        id: "roads",
        paint: {
          "line-color": roadColor,
          "line-width": 2,
        },
        source: "openmaptiles",
        "source-layer": "transportation",
        type: "line",
      },
      {
        filter: ["all", ["has", "name"], ["!", berkeleyLabel]],
        id: "place-labels",
        layout: {
          ...(isSatellite ? { "text-font": satelliteTextFont } : {}),
          "text-anchor": "top",
          "text-field": ["get", "name"],
          "text-size": standardLabelSize,
        },
        paint: {
          "text-color": textColor,
          "text-halo-blur": 0,
          "text-halo-color": textHalo,
          "text-halo-width": standardHaloWidth,
        },
        source: "openmaptiles",
        "source-layer": "poi",
        type: "symbol",
      },
      {
        filter: [
          "all",
          ["has", "name"],
          ["!", exactBerkeleyLabel],
          berkeleyLabel,
        ],
        id: "berkeley-affiliated-poi-labels",
        layout: {
          ...(isSatellite ? { "text-font": satelliteTextFont } : {}),
          "text-anchor": "center",
          "text-field": ["get", "name"],
          "text-padding": 4,
          "text-size": campusLabelSize,
        },
        paint: {
          "text-color": academicTextColor,
          "text-halo-blur": 0,
          "text-halo-color": academicTextHalo,
          "text-halo-width": campusHaloWidth,
        },
        source: "openmaptiles",
        "source-layer": "poi",
        type: "symbol",
      },
      {
        id: "berkeley-custom-labels",
        layout: {
          ...(isSatellite ? { "text-font": satelliteTextFont } : {}),
          "symbol-sort-key": ["get", "priority"],
          "text-anchor": "center",
          "text-field": ["get", "name"],
          "text-padding": 3,
          "text-radial-offset": 0.35,
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            customLabelSize[0],
            16,
            customLabelSize[1],
            18,
            customLabelSize[2],
          ],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
        },
        paint: {
          "text-color": academicTextColor,
          "text-halo-blur": 0,
          "text-halo-color": academicTextHalo,
          "text-halo-width": campusHaloWidth,
        },
        source: "berkeleyLabels",
        type: "symbol",
      },
    ],
    sources: {
      berkeleyLabels: {
        data: BERKELEY_LABEL_GEOJSON,
        type: "geojson",
      },
      openmaptiles: {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
      },
      ...(isSatellite
        ? {
            satellite: {
              attribution: "&copy; Esri",
              tileSize: 256,
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ],
              type: "raster" as const,
            },
          }
        : {}),
    },
    version: 8,
  };
};

interface MapProps {
  selectedSections: SectionColor[];
}

interface ScheduleMapStop {
  buildingName?: string;
  coordinates?: [number, number];
  courseLabel: string;
  endTime: string;
  key: string;
  location?: string | null;
  sectionLabel: string;
  startTime: string;
}

interface LocatedScheduleMapStop extends ScheduleMapStop {
  coordinates: [number, number];
}

interface RouteSegment {
  from: LocatedScheduleMapStop;
  to: LocatedScheduleMapStop;
}

interface RouteLeg {
  distance: number;
  duration: number;
}

interface WalkingRouteResponse {
  code: string;
  message?: string;
  routes?: {
    distance: number;
    duration: number;
    geometry?: {
      coordinates?: [number, number][];
      type: "LineString";
    };
    legs?: RouteLeg[];
  }[];
}

interface MapOverlay {
  height: number;
  routePaths: string[];
  width: number;
}

type RouteStatus = "idle" | "loading" | "ready" | "error";

const emptyMapOverlay: MapOverlay = {
  height: 0,
  routePaths: [],
  width: 0,
};

const getY = (time: string) => {
  const [hour, minute] = time.split(":");
  return parseInt(hour) * 60 + parseInt(minute);
};

const formatTime = (time: string) => {
  const [hourValue, minuteValue] = time.split(":").map(Number);
  const suffix = hourValue < 12 ? "AM" : "PM";
  const hour = hourValue % 12 || 12;

  return `${hour}:${String(minuteValue).padStart(2, "0")} ${suffix}`;
};

const formatDistance = (meters: number) => {
  const miles = meters / 1609.344;

  return miles < 0.1
    ? `${Math.round(meters * 3.28084)} ft`
    : `${miles.toFixed(1)} mi`;
};

const formatDuration = (seconds: number) => {
  const minutes = Math.max(1, Math.round(seconds / 60));

  return `${minutes} min`;
};

const getDistanceMeters = (
  [fromLongitude, fromLatitude]: [number, number],
  [toLongitude, toLatitude]: [number, number]
) => {
  const radius = 6371000;
  const fromLatitudeRadians = (fromLatitude * Math.PI) / 180;
  const toLatitudeRadians = (toLatitude * Math.PI) / 180;
  const latitudeDelta = ((toLatitude - fromLatitude) * Math.PI) / 180;
  const longitudeDelta = ((toLongitude - fromLongitude) * Math.PI) / 180;

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitudeRadians) *
      Math.cos(toLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    radius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
};

const estimateRouteLegFromCoordinates = (
  from: [number, number],
  to: [number, number]
): RouteLeg => {
  const distance = getDistanceMeters(from, to);
  const walkingDistance = distance * 1.25;

  return {
    distance: walkingDistance,
    duration: walkingDistance / 1.35,
  };
};

const estimateRouteLeg = (
  from: LocatedScheduleMapStop,
  to: LocatedScheduleMapStop
): RouteLeg =>
  estimateRouteLegFromCoordinates(from.coordinates, to.coordinates);

const getCoordinateKey = ([longitude, latitude]: [number, number]) =>
  `${longitude.toFixed(6)},${latitude.toFixed(6)}`;

const isLocatedStop = (stop: ScheduleMapStop): stop is LocatedScheduleMapStop =>
  Boolean(stop.coordinates);

const getSvgPath = (points: { x: number; y: number }[]) =>
  points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    )
    .join(" ");

const getWalkingRouteUrl = (coordinates: [number, number][]) => {
  const routeCoordinates = coordinates
    .map(([longitude, latitude]) => `${longitude},${latitude}`)
    .join(";");
  const query = new URLSearchParams({
    geometries: "geojson",
    overview: "full",
    steps: "false",
  });

  return `${WALKING_ROUTE_ENDPOINT}/${routeCoordinates}?${query.toString()}`;
};

const getGoogleMapsRouteUrl = (stops: ScheduleMapStop[]) => {
  const coordinates = stops.flatMap((stop) =>
    stop.coordinates ? [stop.coordinates] : []
  );

  if (coordinates.length < 2) return undefined;

  const [originLongitude, originLatitude] = coordinates[0];
  const [destinationLongitude, destinationLatitude] =
    coordinates[coordinates.length - 1];
  const query = new URLSearchParams({
    api: "1",
    destination: `${destinationLatitude},${destinationLongitude}`,
    origin: `${originLatitude},${originLongitude}`,
    travelmode: "walking",
  });
  const waypoints = coordinates
    .slice(1, -1)
    .map(([longitude, latitude]) => `${latitude},${longitude}`)
    .join("|");

  if (waypoints) query.set("waypoints", waypoints);

  return `https://www.google.com/maps/dir/?${query.toString()}`;
};

const sameCoordinates = (first?: [number, number], second?: [number, number]) =>
  Boolean(
    first && second && getCoordinateKey(first) === getCoordinateKey(second)
  );

const fitMapToCoordinates = (
  map: maplibregl.Map,
  coordinates: [number, number][]
) => {
  if (coordinates.length === 0) {
    map.easeTo({ center: CAMPUS_CENTER, zoom: DEFAULT_ZOOM, duration: 300 });
    return;
  }

  if (coordinates.length === 1 && coordinates[0]) {
    map.easeTo({ center: coordinates[0], zoom: 16.5, duration: 300 });
    return;
  }

  const bounds = coordinates.reduce(
    (bounds, coordinate) => bounds.extend(coordinate),
    new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
  );

  map.fitBounds(bounds, {
    duration: 400,
    maxZoom: 16.5,
    padding: {
      bottom: 96,
      left: 96,
      right: 360,
      top: 96,
    },
  });
};

export default function RouteMap({ selectedSections }: MapProps) {
  const { theme } = useTheme();
  const scheme = useColorScheme();
  const currentTheme = useMemo(() => theme ?? scheme, [theme, scheme]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [activeDay, setActiveDay] = useState(DAYS[0].index);
  const [mapOverlay, setMapOverlay] = useState<MapOverlay>(emptyMapOverlay);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("minimal");
  const [routeCoordinateGroups, setRouteCoordinateGroups] = useState<
    [number, number][][]
  >([]);
  const [routeLegs, setRouteLegs] = useState<RouteLeg[]>([]);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>("idle");
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const stopsByDay = useMemo(() => {
    const nextStopsByDay = DAYS.reduce(
      (acc, day) => ({ ...acc, [day.index]: [] as ScheduleMapStop[] }),
      {} as Record<number, ScheduleMapStop[]>
    );

    selectedSections.forEach(({ section }) => {
      section.meetings?.forEach((meeting, meetingIndex) => {
        if (!meeting.startTime || !meeting.endTime) return;

        DAYS.forEach((day) => {
          if (!meeting.days?.[day.index]) return;

          const building = findBuildingForLocation(meeting.location);
          const sectionLabel = `${section.component} ${section.number}`;

          nextStopsByDay[day.index].push({
            buildingName: building?.name,
            coordinates: building?.location,
            courseLabel: `${section.subject} ${section.courseNumber}`,
            endTime: meeting.endTime,
            key: `${section.sectionId}-${meetingIndex}-${day.index}`,
            location: meeting.location,
            sectionLabel,
            startTime: meeting.startTime,
          });
        });
      });
    });

    DAYS.forEach((day) => {
      nextStopsByDay[day.index].sort(
        (a, b) =>
          getY(a.startTime) - getY(b.startTime) ||
          getY(a.endTime) - getY(b.endTime)
      );
    });

    return nextStopsByDay;
  }, [selectedSections]);

  useEffect(() => {
    const firstDayWithStops =
      DAYS.find((day) => stopsByDay[day.index].length > 0)?.index ??
      DAYS[0].index;

    if (stopsByDay[activeDay].length === 0 && firstDayWithStops !== activeDay) {
      setActiveDay(firstDayWithStops);
    }
  }, [activeDay, stopsByDay]);

  const activeDayLabel = DAYS.find((day) => day.index === activeDay)?.label;
  const activeStops = useMemo(
    () => stopsByDay[activeDay] ?? [],
    [activeDay, stopsByDay]
  );
  const locatedStops = useMemo(
    () => activeStops.filter(isLocatedStop),
    [activeStops]
  );
  const routeSegments = useMemo<RouteSegment[]>(
    () =>
      activeStops.slice(0, -1).flatMap((stop, index) => {
        const nextStop = activeStops[index + 1];

        if (
          !nextStop ||
          !isLocatedStop(stop) ||
          !isLocatedStop(nextStop) ||
          sameCoordinates(stop.coordinates, nextStop.coordinates)
        ) {
          return [];
        }

        return [{ from: stop, to: nextStop }];
      }),
    [activeStops]
  );
  const routeStops = useMemo(() => {
    const firstSegment = routeSegments[0];
    if (!firstSegment) return [];

    const stops: LocatedScheduleMapStop[] = [firstSegment.from];

    routeSegments.forEach((segment) => {
      const previousStop = stops[stops.length - 1];

      if (
        !sameCoordinates(previousStop.coordinates, segment.from.coordinates)
      ) {
        return;
      }

      stops.push(segment.to);
    });

    return stops;
  }, [routeSegments]);
  const googleMapsRouteUrl = useMemo(
    () => getGoogleMapsRouteUrl(routeStops),
    [routeStops]
  );

  const markerGroups = useMemo(() => {
    const groups = new Map<
      string,
      { coordinates: [number, number]; stops: ScheduleMapStop[] }
    >();

    locatedStops.forEach((stop) => {
      if (!stop.coordinates) return;

      const key = getCoordinateKey(stop.coordinates);
      const currentGroup = groups.get(key);

      if (currentGroup) {
        currentGroup.stops.push(stop);
      } else {
        groups.set(key, { coordinates: stop.coordinates, stops: [stop] });
      }
    });

    return Array.from(groups.values());
  }, [locatedStops]);

  const legByStopPair = useMemo(() => {
    const legMap = new Map<string, RouteLeg>();

    routeLegs.forEach((leg, index) => {
      const segment = routeSegments[index];

      if (segment) legMap.set(`${segment.from.key}:${segment.to.key}`, leg);
    });

    return legMap;
  }, [routeLegs, routeSegments]);

  useEffect(() => {
    if (!containerRef.current) return;

    setMapLoaded(false);

    const map = new maplibregl.Map({
      attributionControl: false,
      center: CAMPUS_CENTER,
      container: containerRef.current,
      maxZoom: MAX_ZOOM,
      minZoom: MIN_ZOOM,
      style: getBaseMapStyle(currentTheme, mapMode),
      zoom: DEFAULT_ZOOM,
    });

    map.on("load", () => {
      setMapLoaded(true);
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("zoomend", () => {
      setZoom(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      setMapOverlay(emptyMapOverlay);
      map.remove();
    };
  }, [currentTheme, mapMode]);

  useEffect(() => {
    setRouteCoordinateGroups([]);
    setRouteLegs([]);

    if (routeSegments.length === 0) {
      setRouteStatus("idle");
      return;
    }

    const controller = new AbortController();

    setRouteStatus("loading");

    Promise.all(
      routeSegments.map(async (segment) => {
        const response = await fetch(
          getWalkingRouteUrl([
            segment.from.coordinates,
            segment.to.coordinates,
          ]),
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error(`Routing failed: ${response.status}`);

        const data = (await response.json()) as WalkingRouteResponse;
        const route = data.routes?.[0];
        const routedCoordinates = route?.geometry?.coordinates;

        if (
          data.code !== "Ok" ||
          !route ||
          !routedCoordinates ||
          routedCoordinates.length < 2
        ) {
          throw new Error(data.message ?? "Routing failed");
        }

        return {
          coordinates: routedCoordinates,
          leg: route.legs?.[0] ?? estimateRouteLeg(segment.from, segment.to),
        };
      })
    )
      .then((routes) => {
        setRouteCoordinateGroups(routes.map((route) => route.coordinates));
        setRouteLegs(routes.map((route) => route.leg));
        setRouteStatus("ready");
      })
      .catch(() => {
        if (controller.signal.aborted) return;

        setRouteCoordinateGroups([]);
        setRouteLegs([]);
        setRouteStatus("error");
      });

    return () => controller.abort();
  }, [routeSegments]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const updateMapOverlay = () => {
      const canvas = map.getCanvas();
      const routePaths = routeCoordinateGroups.map((coordinates) => {
        const routePoints = coordinates.map((coordinate) => {
          const projected = map.project(coordinate);

          return { x: projected.x, y: projected.y };
        });

        return getSvgPath(routePoints);
      });

      setMapOverlay({
        height: canvas.clientHeight,
        routePaths,
        width: canvas.clientWidth,
      });
    };

    updateMapOverlay();
    map.on("move", updateMapOverlay);
    map.on("zoom", updateMapOverlay);
    window.addEventListener("resize", updateMapOverlay);

    return () => {
      map.off("move", updateMapOverlay);
      map.off("zoom", updateMapOverlay);
      window.removeEventListener("resize", updateMapOverlay);
    };
  }, [mapLoaded, routeCoordinateGroups]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    markerGroups.forEach((group) => {
      const firstStop = group.stops[0];
      if (!firstStop) return;

      const markerElement = document.createElement("div");
      markerElement.className = styles.mapMarker;
      markerElement.textContent =
        group.stops.length === 1
          ? String(activeStops.indexOf(firstStop) + 1)
          : `${activeStops.indexOf(firstStop) + 1}+`;

      const popupContent = document.createElement("div");
      popupContent.className = styles.popup;

      group.stops.forEach((stop) => {
        const stopElement = document.createElement("div");
        stopElement.className = styles.popupStop;

        const title = document.createElement("p");
        title.className = styles.popupTitle;
        title.textContent = `${stop.courseLabel} ${stop.sectionLabel}`;

        const details = document.createElement("p");
        details.textContent = `${formatTime(stop.startTime)} - ${formatTime(stop.endTime)}`;

        stopElement.append(title, details);
        popupContent.append(stopElement);
      });

      const marker = new maplibregl.Marker({
        element: markerElement,
      })
        .setLngLat(group.coordinates)
        .setPopup(
          new maplibregl.Popup({
            closeButton: false,
            offset: 16,
          }).setDOMContent(popupContent)
        )
        .addTo(map);

      markersRef.current.push(marker);
    });

    fitMapToCoordinates(
      map,
      markerGroups.map((group) => group.coordinates)
    );
  }, [activeStops, mapLoaded, markerGroups]);

  return (
    <div className={styles.root}>
      <div className={styles.toolBar}>
        <div className={styles.dayTabs}>
          {DAYS.map((day) => (
            <MenuItem
              key={day.index}
              active={activeDay === day.index}
              onClick={() => setActiveDay(day.index)}
              title={`${day.label} route`}
            >
              {day.short}
            </MenuItem>
          ))}
        </div>
        <IconButton
          disabled={zoom >= MAX_ZOOM}
          onClick={() => mapRef.current?.zoomIn()}
        >
          <ZoomIn />
        </IconButton>
        <IconButton
          disabled={zoom <= MIN_ZOOM}
          onClick={() => mapRef.current?.zoomOut()}
        >
          <ZoomOut />
        </IconButton>
      </div>
      <div className={styles.mapControls}>
        <div className={styles.mapModeToggle} aria-label="Map style">
          {MAP_MODE_OPTIONS.map((option) => (
            <button
              aria-pressed={mapMode === option.value}
              className={`${styles.mapModeButton} ${
                mapMode === option.value ? styles.mapModeButtonActive : ""
              }`}
              key={option.value}
              onClick={() => setMapMode(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <a
          aria-disabled={!googleMapsRouteUrl}
          className={`${styles.googleMapsLink} ${
            googleMapsRouteUrl ? "" : styles.googleMapsLinkDisabled
          }`}
          href={googleMapsRouteUrl ?? "#"}
          onClick={(event) => {
            if (!googleMapsRouteUrl) event.preventDefault();
          }}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ArrowUpRight />
          Google Maps
        </a>
      </div>
      <div className={styles.container} ref={containerRef} />
      {mapOverlay.width > 0 && mapOverlay.height > 0 && (
        <svg
          aria-hidden
          className={styles.mapOverlay}
          viewBox={`0 0 ${mapOverlay.width} ${mapOverlay.height}`}
        >
          {mapOverlay.routePaths.map((routePath, index) => (
            <g key={`${index}-${routePath}`}>
              <path className={styles.routeHalo} d={routePath} />
              <path className={styles.routeLine} d={routePath} />
            </g>
          ))}
        </svg>
      )}
      <div className={styles.sideBar}>
        <div className={styles.sideBarHeader}>
          <p className={styles.heading}>{activeDayLabel}</p>
          <p className={styles.summary}>
            {activeStops.length === 0
              ? "No in-person meetings"
              : `${activeStops.length} meeting${activeStops.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {activeStops.length === 0 ? (
          <p className={styles.empty}>
            Select another day or add classes with scheduled locations.
          </p>
        ) : (
          activeStops.map((stop, index) => {
            const nextStop = activeStops[index + 1];
            const routeLeg =
              nextStop && legByStopPair.get(`${stop.key}:${nextStop.key}`);
            const sameLocation = sameCoordinates(
              stop.coordinates,
              nextStop?.coordinates
            );
            const routePending =
              nextStop &&
              stop.coordinates &&
              nextStop.coordinates &&
              !sameLocation &&
              routeStatus === "loading";
            const routeUnavailable =
              nextStop &&
              (!stop.coordinates ||
                !nextStop.coordinates ||
                routeStatus === "error" ||
                !routeLeg) &&
              !sameLocation &&
              !routePending;

            return (
              <div key={stop.key} className={styles.timelineItem}>
                <div className={styles.waypoint}>
                  <div className={styles.number}>{index + 1}</div>
                  <div className={styles.text}>
                    <p className={styles.label}>
                      {formatTime(stop.startTime)} - {formatTime(stop.endTime)}
                    </p>
                    <p className={styles.heading}>
                      {stop.courseLabel} {stop.sectionLabel}
                    </p>
                    <p className={styles.description}>
                      {stop.buildingName ?? stop.location ?? "Location TBD"}
                    </p>
                  </div>
                </div>
                {nextStop && (
                  <div className={styles.leg}>
                    <Walking />
                    <div className={styles.value}>
                      {sameLocation ? (
                        "Same location"
                      ) : routeLeg ? (
                        <>
                          <span className={styles.distance}>
                            {formatDuration(routeLeg.duration)}
                          </span>{" "}
                          ({formatDistance(routeLeg.distance)})
                        </>
                      ) : routeUnavailable ? (
                        "Route unavailable"
                      ) : routePending ? (
                        "Calculating route"
                      ) : (
                        "Route unavailable"
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
