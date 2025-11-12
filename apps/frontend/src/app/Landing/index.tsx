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
    colors: ["#76A6FF", "#4FB4FF"],
    image: morning,
  },
  {
    colors: ["#26C9A5", "#DFCA6B"],
    image: afternoon,
  },
  {
    colors: ["#E4A70A", "#FF7500"],
    image: sunset,
  },
  {
    colors: ["#10101A", "#161646"],
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
