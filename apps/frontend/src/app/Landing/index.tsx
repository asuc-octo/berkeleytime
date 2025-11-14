import { useEffect, useMemo, useState } from "react";

import Features from "./Features";
import Hero from "./Hero";
import afternoon from "./Hero/afternoon.svg";
import dawn from "./Hero/dawn.svg";
import dusk from "./Hero/dusk.svg";
import morning from "./Hero/morning.svg";
import sunrise from "./Hero/sunrise.svg";
import sunset from "./Hero/sunset.svg";
import styles from "./Landing.module.scss";
import Organization from "./Organization";

type Point = { x: number; y: number };

const BASE_CURVE_DIMENSIONS = {
  height: 120,
};

const CURVE_POINTS: Record<"start" | "cp1" | "cp2" | "end", Point> = {
  start: { x: 0, y: 10 },
  cp1: { x: 150, y: 0 },
  cp2: { x: 200, y: 150 },
  end: { x: 300, y: 100 },
};

const CURVE_X_RANGE = CURVE_POINTS.end.x - CURVE_POINTS.start.x;

function scalePoint(point: Point, width: number, height: number): Point {
  return {
    x: ((point.x - CURVE_POINTS.start.x) / CURVE_X_RANGE) * width,
    y: (point.y / BASE_CURVE_DIMENSIONS.height) * height,
  };
}

function generateWavePath(width: number, height: number): string {
  const start = scalePoint(CURVE_POINTS.start, width, height);
  const cp1 = scalePoint(CURVE_POINTS.cp1, width, height);
  const cp2 = scalePoint(CURVE_POINTS.cp2, width, height);
  const end = scalePoint(CURVE_POINTS.end, width, height);

  return `
    M 0 ${height}
    L 0 ${start.y}
    L ${start.x} ${start.y}
    C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}
    L ${width} ${height}
    L 0 ${height}
    Z
  `.trim();
}

// TODO: Tailwind color gradients
const steps = [
  {
    colors: ["#F33754", "#7C87F9"],
    image: dawn,
  },
  {
    colors: ["#F1A848", "#F55998"],
    image: sunrise,
  },
  {
    colors: ["#408FF7", "#0DD0DA"],
    image: morning,
  },
  {
    colors: ["#4FC351", "#CAC638"],
    image: afternoon,
  },
  {
    colors: ["#E4A70A", "#FF7500"],
    image: sunset,
  },
  {
    colors: ["#082D65", "#0E1B3B"],
    angle: "to bottom right",
    image: dusk,
  },
];

const getStep = (milliseconds: number) => {
  const date = new Date(milliseconds);
  const hour = date.getHours();

  // 6am to 10am => sunrise
  if (hour >= 6 && hour < 10) return steps[1];
  // 10am to 1pm => morning
  if (hour >= 10 && hour < 13) return steps[2];
  // 1pm to 4pm => afternoon
  if (hour >= 13 && hour < 16) return steps[3];
  // 4pm to 7pm => sunset
  if (hour >= 16 && hour < 19) return steps[4];
  // 9pm to 4am => dusk
  if (hour >= 21 || hour < 4) return steps[5];

  // 4am to 6am or 7pm to 9pm => dawn
  return steps[0];
};

const Home = () => {
  // Berkeley time
  const [milliseconds, setMilliseconds] = useState(
    () => Date.now() - 10 * 60 * 1000
  );

  const [dimensions, setDimensions] = useState({ width: 1510, height: 200 });

  const step = useMemo(() => {
    return getStep(milliseconds);
  }, [milliseconds]);

  useEffect(() => {
    const interval = setInterval(
      () => setMilliseconds((milliseconds) => milliseconds + 1000),
      1000
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      const vw = window.innerWidth;
      const calculatedHeight = Math.max(100, Math.min(vw * 0.2, 200));

      setDimensions({
        width: vw,
        height: calculatedHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className={styles.root}>
      <Hero step={step} milliseconds={milliseconds} />
      <div className={styles.features}>
        <Features />
      </div>
      <svg
        className={styles.bottomWave}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fill="var(--neutral-900)"
          d={generateWavePath(dimensions.width, dimensions.height)}
        />
      </svg>
      <Organization />
    </div>
  );
};

export default Home;
