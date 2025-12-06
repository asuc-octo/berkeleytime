import { ArrowUpRight, Clock } from "iconoir-react";
import { Link } from "react-router-dom";

import Wave from "../Wave";
import styles from "./Hero.module.scss";
import SatherTower from "./SatherTower";
import { useSkyGradient } from "./useSkyGradient";

interface HeroProps {
  milliseconds: number;
}

export default function Hero({ milliseconds }: HeroProps) {
  const { gradient } = useSkyGradient(milliseconds);

  return (
    <div className={styles.root}>
      <div className={styles.gradientLayer} style={{ background: gradient }} />
      <div className={styles.heroContent}>
        <div className={styles.text}>
          <h1 className={styles.heading}>
            Confidently plan and manage your schedule
          </h1>
          <h2 className={styles.description}>
            Berkeley's largest course discovery platform built and run by
            students, for students
          </h2>
          <Link to="/catalog" className={styles.catalogLink}>
            Go to Catalog
            <ArrowUpRight />
          </Link>
        </div>
        <div className={styles.clock}>
          <Clock height={18} width={18} />
          <p className={styles.time}>
            {new Date(milliseconds).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "numeric",
            })}
          </p>
          <p className={styles.location}>Berkeley, CA</p>
        </div>
        <SatherTower className={styles.campanile} milliseconds={milliseconds} />
      </div>
      <Wave className={styles.wave} />
    </div>
  );
}
