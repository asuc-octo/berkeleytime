import { FormEvent, useEffect, useRef, useState } from "react";

import { ArrowRight, Clock } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Box, Button, Container } from "@repo/theme";

import NavigationBar from "@/components/NavigationBar";

import styles from "./Hero.module.scss";

interface HeroProps {
  step: {
    colors: string[];
    gradient?: string[];
    angle?: string;
    image: string;
  };
  milliseconds: number;
}

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

export default function Hero({ step, milliseconds }: HeroProps) {
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1510, height: 283 });

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const [start, stop] = step.gradient ?? step.colors;
    const { angle } = step;

    element.style.setProperty("--landing-gradient-start", start);
    element.style.setProperty("--landing-gradient-stop", stop);

    if (angle) {
      element.style.setProperty("--landing-gradient-angle", angle);
      return;
    }

    element.style.removeProperty("--landing-gradient-angle");
  }, [step]);

  useEffect(() => {
    const updateDimensions = () => {
      // Calculate height based on viewport width: clamp(100px, 20vw, 200px)
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = formData.get("query");

    navigate(`/catalog?query=${query}`);
  };

  return (
    <div className={styles.root} ref={root}>
      <NavigationBar invert accentColor={step.colors[1]} />
      <Box px="5">
        <Container flexGrow="1" className={styles.container}>
          <div className={styles.text}>
            <h1 className={styles.heading}>
              Confidently plan and manage your schedule
            </h1>
            <h2 className={styles.description}>
              Berkeley's largest course discovery platform built and run by
              students, for students
            </h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                className={styles.input}
                type="text"
                autoFocus
                name="query"
                required
                placeholder="Search for courses..."
              />
              <Button>
                Go
                <ArrowRight />
              </Button>
            </form>
          </div>
          <div className={styles.clock}>
            <Clock height={24} width={24} />
            <p className={styles.heading}>
              {new Date(milliseconds).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              })}
            </p>
            <p className={styles.description}>Berkeley time</p>
          </div>
          <img className={styles.campanile} src={step.image} />
        </Container>
      </Box>
      <svg
        className={styles.wave}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d={generateWavePath(dimensions.width, dimensions.height)}
        />
      </svg>
    </div>
  );
}
