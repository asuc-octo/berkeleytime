import { useEffect, useState } from "react";

type Point = { x: number; y: number };

const BASE_CURVE_DIMENSIONS = {
  height: 150,
};

const CURVE_POINTS: Record<"start" | "cp1" | "cp2" | "end", Point> = {
  start: { x: 0, y: 20 },
  cp1: { x: 150, y: 0 },
  cp2: { x: 200, y: 150 },
  end: { x: 300, y: 130 },
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

interface WaveProps {
  className?: string;
  fill?: string;
}

export default function Wave({ className, fill = "currentColor" }: WaveProps) {
  const [dimensions, setDimensions] = useState({ width: 1510, height: 350 });

  useEffect(() => {
    const updateDimensions = () => {
      const vw = window.innerWidth;
      const calculatedHeight = Math.max(175, Math.min(vw * 0.35, 350));

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
    <svg
      className={className}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill={fill}
        d={generateWavePath(dimensions.width, dimensions.height)}
      />
    </svg>
  );
}
