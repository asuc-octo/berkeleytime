import { useEffect, useMemo, useRef, useState } from "react";

import { DataTransferBoth, Xmark } from "iconoir-react";
import { Link, useOutletContext } from "react-router-dom";

import IconButton from "@/components/IconButton";
import Tooltip from "@/components/Tooltip";
import Units from "@/components/Units";
import Week from "@/components/Week";

import { ScheduleContextType } from "../schedule";
import styles from "./Compare.module.scss";

export default function Compare() {
  const { selectedSections, classes } = useOutletContext<ScheduleContextType>();
  const [y, setY] = useState<number | null>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<number | null>(null);

  const [minimum, maximum] = useMemo(
    () =>
      classes.reduce(
        ([minimum, maximum], { unitsMax, unitsMin }) => [
          minimum + unitsMin,
          maximum + unitsMax,
        ],
        [0, 0]
      ),
    [classes]
  );

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return;

    const left = leftRef.current;
    const right = rightRef.current;

    const handleScroll = (left?: boolean) => {
      if (!leftRef.current || !rightRef.current) return;

      if (left) {
        if (current === 1) return;

        rightRef.current.scrollTo({
          top: leftRef.current.scrollTop,
          left: leftRef.current.scrollLeft,
        });

        return;
      }

      if (current === 0) return;

      leftRef.current.scrollTo({
        top: rightRef.current.scrollTop,
        left: rightRef.current.scrollLeft,
      });
    };

    const handleLeftScroll = () => handleScroll(true);
    left.addEventListener("scroll", handleLeftScroll);

    const handleRightScroll = () => handleScroll();
    right.addEventListener("scroll", handleRightScroll);

    return () => {
      right.removeEventListener("scroll", handleLeftScroll);
      left.removeEventListener("scroll", handleRightScroll);
    };
  }, [current]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.group}>
          <p className={styles.heading}>Untitled Fall 2024 schedule</p>
          <p className={styles.paragraph}>Fall 2024</p>
        </div>
        <div className={styles.group}>
          <p className={styles.heading}>No schedule selected</p>
          <IconButton>
            <DataTransferBoth />
          </IconButton>
          <Tooltip content="Close">
            <Link to="../">
              <IconButton>
                <Xmark />
              </IconButton>
            </Link>
          </Tooltip>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.panel}>
          <div className={styles.context}>
            <div className={styles.data}>Fall 2024</div>
            <div className={styles.data}>
              {classes.length === 1 ? "1 class" : `${classes.length} classes`},{" "}
              <Units unitsMin={minimum} unitsMax={maximum}>
                {(units) => units}
              </Units>
            </div>
          </div>
          <div
            className={styles.view}
            ref={leftRef}
            onMouseEnter={() => setCurrent(0)}
            onMouseLeave={() =>
              setCurrent((previous) => (previous === 0 ? null : previous))
            }
          >
            <Week
              selectedSections={selectedSections}
              y={y}
              classes={classes}
              updateY={setY}
            />
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.context}>
            <div className={styles.data}>Fall 2024</div>
            <div className={styles.data}>
              {classes.length === 1 ? "1 class" : `${classes.length} classes`},{" "}
              <Units unitsMin={12} unitsMax={20}>
                {(units) => units}
              </Units>
            </div>
          </div>
          <div
            className={styles.view}
            ref={rightRef}
            onMouseEnter={() => setCurrent(1)}
            onMouseLeave={() =>
              setCurrent((previous) => (previous === 1 ? null : previous))
            }
          >
            <Week selectedSections={[]} y={y} updateY={setY} />
          </div>
        </div>
      </div>
    </div>
  );
}
