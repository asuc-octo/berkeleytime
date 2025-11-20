import { useEffect, useMemo, useState } from "react";

import SunCalc from "suncalc";

import Features from "./Features";
import Hero from "./Hero";
import daytime from "./Hero/daytime.svg";
import night from "./Hero/night.svg";
import sunrise_sunset from "./Hero/sunrise_sunset.svg";
import styles from "./Landing.module.scss";
import Organization from "./Organization";
import Wave from "./Wave";

// TODO: Tailwind color gradients
const steps = {
  night: {
    colors: ["#082D65", "#0E1B3B"],
    angle: "to bottom right",
    image: night,
  },
  sunrise_sunset: {
    colors: ["#F1A848", "#F55998"],
    image: sunrise_sunset,
  },
  daytime: {
    colors: ["#408FF7", "#0DD0DA"],
    image: daytime,
  },
};

// UC Berkeley coordinates
const BERKELEY_LAT = 37.8719;
const BERKELEY_LNG = -122.2585;

const getStep = (milliseconds: number) => {
  const date = new Date(milliseconds);
  const times = SunCalc.getTimes(date, BERKELEY_LAT, BERKELEY_LNG);

  const now = date.getTime();
  const dawnTime = times.dawn.getTime();
  const goldenHourEndTime = times.goldenHourEnd.getTime();
  const goldenHourTime = times.goldenHour.getTime();
  const duskTime = times.dusk.getTime();

  if (now >= dawnTime && now < goldenHourEndTime) return steps.sunrise_sunset;
  if (now >= goldenHourEndTime && now < goldenHourTime) return steps.daytime;
  if (now >= goldenHourTime && now < duskTime) return steps.sunrise_sunset;
  return steps.night;
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
      <div className={styles.features}>
        <Features />
      </div>
      <Wave className={styles.bottomWave} fill="var(--neutral-900)" />
      <Organization />
    </div>
  );
};

export default Home;
