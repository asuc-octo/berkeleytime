import { FormEvent } from "react";

import { ArrowRight, Clock } from "iconoir-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@repo/theme";

import styles from "./Hero.module.scss";
import SatherTower from "./SatherTower";
import Wave from "../Wave";

interface HeroProps {
  milliseconds: number;
}

export default function Hero({ milliseconds }: HeroProps) {
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = formData.get("query");

    navigate(`/catalog?query=${query}`);
  };

  return (
    <div className={styles.root}>
      <div className={styles.gradientLayer1} />
      <div className={styles.gradientLayer2} />
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
        <SatherTower className={styles.campanile} milliseconds={milliseconds} />
      </div>
      <Wave className={styles.wave} />
    </div>
  );
}
