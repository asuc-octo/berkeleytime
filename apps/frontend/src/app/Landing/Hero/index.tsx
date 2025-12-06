import { FormEvent, useEffect, useRef } from "react";

import { ArrowRight, Clock } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@repo/theme";

import Wave from "../Wave";
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

export default function Hero({ step, milliseconds }: HeroProps) {
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);

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

    const formData = new FormData(event.currentTarget);
    const query = formData.get("query");

    navigate(`/catalog?query=${query}`);
  };

  return (
    <div className={styles.root} ref={root}>
      <div className={styles.heroContent}>
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
      </div>
      <Wave className={styles.wave} />
    </div>
  );
}
