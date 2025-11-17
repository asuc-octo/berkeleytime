import { useEffect, useMemo, useState } from "react";

import SunCalc from "suncalc";

import Features from "./Features";
import Hero from "./Hero";
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

// UC Berkeley coordinates
const BERKELEY_LAT = 37.8719;
const BERKELEY_LNG = -122.2585;

const getStep = (milliseconds: number) => {
  const date = new Date(milliseconds);
  const times = SunCalc.getTimes(date, BERKELEY_LAT, BERKELEY_LNG);

  const now = date.getTime();
  const dawnTime = times.dawn.getTime();
  const sunriseEndTime = times.sunriseEnd.getTime();
  const goldenHourEndTime = times.goldenHourEnd.getTime();
  const goldenHourTime = times.goldenHour.getTime();
  const duskTime = times.dusk.getTime();

  if (now >= dawnTime && now < sunriseEndTime) return steps.sunrise;
  if (now >= sunriseEndTime && now < goldenHourEndTime)
    return steps.earlyMorning;
  if (now >= goldenHourEndTime && now < goldenHourTime) return steps.daytime;
  if (now >= goldenHourTime && now < duskTime) return steps.sunset;
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
