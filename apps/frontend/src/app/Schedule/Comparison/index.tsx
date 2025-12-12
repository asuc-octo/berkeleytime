import { useEffect, useMemo, useRef, useState } from "react";

import { Xmark } from "iconoir-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { IconButton, Select, Tooltip } from "@repo/theme";
import type { Option } from "@repo/theme";

import Week from "@/app/Schedule/Week";
import Units from "@/components/Units";
import { useReadSchedule, useReadSchedules } from "@/hooks/api";
import useSchedule from "@/hooks/useSchedule";
import { IScheduleListSchedule, ScheduleIdentifier } from "@/lib/api";

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
    () => getUnits(comparison ?? undefined),
    [comparison]
  );

  const selectedSections = useMemo(
    () => getSelectedSections(schedule),
    [schedule]
  );

  const selectedComparisonSections = useMemo(
    () => getSelectedSections(comparison ?? undefined),
    [comparison]
  );

  const SEMESTER_ORDER = ["Spring", "Summer", "Fall"];

  const scheduleOptions = useMemo<Option<string>[]>(() => {
    if (!schedules) return [];

    // Group schedules by semester
    const schedulesBySemester = schedules
      .filter((_schedule) => _schedule?._id !== schedule._id)
      .reduce(
        (acc, _schedule) => {
          if (!_schedule) return acc;
          const term = `${_schedule.semester} ${_schedule.year}`;
          if (!acc[term]) acc[term] = [];
          acc[term].push(_schedule);
          return acc;
        },
        {} as { [key: string]: IScheduleListSchedule[] }
      );

    // Convert to grouped options with labels
    const sortedTerms = Object.keys(schedulesBySemester).sort((a, b) => {
      const [semA, yearA] = a.split(" ");
      const [semB, yearB] = b.split(" ");
      const yearDiff = Number(yearB) - Number(yearA);
      if (yearDiff !== 0) return yearDiff;
      return (
        SEMESTER_ORDER.indexOf(semB) - SEMESTER_ORDER.indexOf(semA)
      );
    });

    const options: Option<string>[] = [];
    sortedTerms.forEach((term) => {
      // Add label for the semester group
      options.push({ type: "label", label: term });
      // Add schedules for this semester
      schedulesBySemester[term].forEach((_schedule) => {
        options.push({
          value: _schedule?._id ?? "",
          label: _schedule?.name ?? "",
        });
      });
    });

    return options;
  }, [schedules, schedule._id]);

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
          <div style={{ flex: 1, minWidth: 0, marginRight: 12, display: "flex", alignItems: "center" }}>
            <Select<string>
              searchable
              options={scheduleOptions}
              value={comparisonId ?? null}
              onChange={(value) => {
                if (Array.isArray(value)) return;
                if (value) {
                  navigate(`/schedules/${schedule._id}/compare/${value}`);
                } else {
                  navigate(`/schedules/${schedule._id}/compare`);
                }
              }}
              placeholder="Select a schedule to compare"
              searchPlaceholder="Search schedules..."
              emptyMessage="No schedules found."
              style={{ width: "100%" }}
            />
          </div>
          <Tooltip
            trigger={
              <Link to="../">
                <IconButton>
                  <Xmark />
                </IconButton>
              </Link>
            }
            title="Close"
          />
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.panel}>
          <div className={styles.context}>
            <div className={styles.data}>
              {schedule.semester} {schedule.year}
            </div>
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
            <div className={styles.data}>
              {comparison?.semester} {comparison?.year}
            </div>
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
