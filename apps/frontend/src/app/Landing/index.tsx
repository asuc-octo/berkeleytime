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
import Wave from "./Wave";

// TODO: Tailwind color gradients
const steps = {
  night: {
    colors: ["#082D65", "#0E1B3B"],
    angle: "to bottom right",
    image: dusk,
  },
  sunrise: {
    colors: ["#F1A848", "#F55998"],
    image: sunrise,
  },
  earlyMorning: {
    colors: ["#E4A70A", "#FF7500"],
    image: sunset,
  },
  daytime: {
    colors: ["#408FF7", "#0DD0DA"],
    image: morning,
  },
  sunset: {
    colors: ["#F33754", "#7C87F9"],
    image: dawn,
  },
};

const getStep = (milliseconds: number) => {
  const date = new Date(milliseconds);
  const hour = date.getHours();

  // 5am to 8am => sunrise
  if (hour >= 5 && hour < 8) return steps.sunrise;
  // 8am to 11am => early morning
  if (hour >= 8 && hour < 11) return steps.earlyMorning;
  // 11am to 5pm => daytime
  if (hour >= 11 && hour < 17) return steps.daytime;
  // 5pm to 9pm => sunset
  if (hour >= 17 && hour < 21) return steps.sunset;

  // 9pm to 5am => night
  return steps.night;
};

const Home = () => {
  // Berkeley time
  const [milliseconds, setMilliseconds] = useState(
    () => Date.now() - 10 * 60 * 1000
  );

  const step = useMemo(() => {
    return steps.daytime;
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
      <div className={styles.features}>
        <Features />
      </div>
      <Wave className={styles.bottomWave} fill="var(--neutral-900)" />
      <Organization />
    </div>
  );
};

export default Home;
