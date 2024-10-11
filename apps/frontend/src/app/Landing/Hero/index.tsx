import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ArrowRight, Clock } from "iconoir-react";

import { Button } from "@repo/theme";

import NavigationBar from "@/components/NavigationBar";

import styles from "./Hero.module.scss";
import afternoon from "./afternoon.svg";
import dawn from "./dawn.svg";
import dusk from "./dusk.svg";
import morning from "./morning.svg";
import sunrise from "./sunrise.svg";
import sunset from "./sunset.svg";
import wave from "./wave.svg";

// TODO: Tailwind color gradients
const steps = [
  {
    colors: ["#CFADD4", "#B5B2D9"],
    // gradient: ["var(--purple-400)", "var(--violet-400)"],
    // color: "var(--violet-500)",
    image: dawn,
  },
  {
    colors: ["#D3A4BF", "#EEC9C1"],
    // gradient: ["var(--fuchsia-400)", "var(--purple-400)"],
    // color: "var(--purple-500)",
    image: sunrise,
  },
  {
    colors: ["#DCD6C4", "#C8DCD9"],
    image: morning,
  },
  {
    gradient: ["var(--blue-500)", "var(--sky-500)"],
    colors: ["#3b82f6", "#0ea5e9"],
    image: afternoon,
  },
  {
    colors: ["#D25950", "#EE8A1F"],
    image: sunset,
  },
  {
    colors: ["#10101B", "#202036"],
    angle: "to bottom right",
    image: dusk,
  },
];

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  // Berkeley time
  const [milliseconds, setMilliseconds] = useState(
    () => Date.now() - 10 * 60 * 1000
  );

  const step = useMemo(() => {
    // const date = new Date(milliseconds);
    // const index = Math.floor(((date.getHours() - 0) / 24) * 6);
    return steps[3];
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setMilliseconds((milliseconds) => milliseconds + 1000),
      1000
    );

    return () => clearInterval(interval);
  }, []);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className={styles.root} ref={root}>
      <NavigationBar invert />
      <div className={styles.container}>
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
              placeholder="Search for courses..."
            />
            <Button className={styles.button}>
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
      </div>
      <img className={styles.wave} src={wave} />
    </div>
  );
}
