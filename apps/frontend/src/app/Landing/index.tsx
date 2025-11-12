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
import bottomWave from "./bottom_wave.svg";

// TODO: Tailwind color gradients
const steps = [
  {
    colors: ["#D45C72", "#ADA6FD"],
    image: dawn,
  },
  {
    colors: ["#FFAE74", "#FF9EB0"],
    image: sunrise,
  },
  {
    colors: ["#26C9A5", "#DFCA6B"],
    image: morning,
  },
  {
    gradient: ["var(--blue-500)", "var(--sky-500)"],
    colors: ["var(--blue-500)", "#0ea5e9"],
    image: afternoon,
  },
  {
    colors: ["#D45C72", "#ADA6FD"],
    image: sunset,
  },
  {
    colors: ["#10101B", "#202036"],
    angle: "to bottom right",
    image: dusk,
  },
];

const getStep = (milliseconds: number) => {
  const date = new Date(milliseconds);
  const index = Math.floor(((date.getHours() - 0) / 24) * 6);
  return steps[index];
};

const Home = () => {
  // Berkeley time
  const [milliseconds, setMilliseconds] = useState(
    () => Date.now() - 10 * 60 * 1000
  );

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

  return (
    <div className={styles.root}>
      <Hero step={step} milliseconds={milliseconds} />
      <Features />
      <img style={{ backgroundColor: "var(--neutral-900)" }} src={bottomWave} />
      <Organization />
    </div>
  );
};

export default Home;
