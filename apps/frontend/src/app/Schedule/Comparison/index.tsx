import { useEffect, useMemo, useRef, useState } from "react";

import { DataTransferBoth, Xmark } from "iconoir-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { DropdownMenu, IconButton, Tooltip } from "@repo/theme";

import Week from "@/app/Schedule/Week";
import Units from "@/components/Units";
import { useReadSchedule, useReadSchedules } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";
import { ScheduleIdentifier } from "@/lib/api";

import { getSelectedSections, getUnits } from "../schedule";
import styles from "./Comparison.module.scss";

export default function Comparison() {

  const navigate = useNavigate();

  const { data: schedules } = useReadSchedules();

  const { schedule } = useSchedule();

  const { comparisonId } = useParams();

  const { data: comparison } = useReadSchedule(
    comparisonId as ScheduleIdentifier
  );

  const [minimum, maximum] = useMemo(() => getUnits(schedule), [schedule]);

  const [comparisonMinimum, comparisonMaximum] = useMemo(
    () => getUnits(comparison),
    [comparison]
  );

  const selectedSections = useMemo(
    () => getSelectedSections(schedule),
    [schedule]
  );

  const selectedComparisonSections = useMemo(
    () => getSelectedSections(comparison),
    [comparison]
  );

  const [y, setY] = useState<number | null>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<number | null>(null);

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
          <p className={styles.heading}>{schedule.name}</p>
          {/* Information is redundant -> <p className={styles.paragraph}>{schedule.semester} {schedule.year}</p> */}
        </div>
        <div className={styles.group}>
          <p className={styles.heading}>{ comparison ? comparison.name : "No schedule selected" }</p>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton>
                <DataTransferBoth />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content style={{width: 250, position: "relative", left: -30}}>
              { 
                schedules && (
                  schedules.map((_schedule) => {
                    return <DropdownMenu.Item onClick={() => { navigate(`/schedules/${schedule._id}/compare/${_schedule._id}`) }}>
                      {_schedule.name} - {_schedule.semester} {_schedule.year}
                    </DropdownMenu.Item>
                  })
                )
              }
            </DropdownMenu.Content>
          </DropdownMenu.Root>
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
            <div className={styles.data}>{schedule.semester} {schedule.year}</div>
            <div className={styles.data}>
              {schedule.classes.length === 1
                ? "1 class"
                : `${schedule.classes.length} classes`}
              ,{" "}
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
              events={schedule.events}
              selectedSections={selectedSections}
              y={y}
              updateY={setY}
            />
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.context}>
            <div className={styles.data}>{comparison?.semester} {comparison?.year}</div>
            <div className={styles.data}>
              {comparison
                ? comparison.classes.length === 1
                  ? "1 class"
                  : `${comparison.classes.length} classes`
                : "No classes"}
              ,{" "}
              <Units unitsMin={comparisonMinimum} unitsMax={comparisonMaximum}>
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
            <Week
              events={comparison?.events ?? []}
              selectedSections={selectedComparisonSections}
              y={y}
              updateY={setY}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
