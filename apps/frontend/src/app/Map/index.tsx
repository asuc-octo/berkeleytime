import { useEffect, useMemo } from "react";

import { ArrowRight, Calendar, Plus } from "iconoir-react";
import { Link, useSearchParams } from "react-router-dom";

import { Button, LoadingIndicator } from "@repo/theme";

import RouteMap from "@/app/Schedule/Editor/Map";
import {
  getNextClassColor,
  getSelectedSections,
} from "@/app/Schedule/schedule";
import { useReadSchedule, useReadSchedules } from "@/hooks/api";
import useUser from "@/hooks/useUser";
import { signIn } from "@/lib/api";
import { Color } from "@/lib/generated/graphql";

import styles from "./Map.module.scss";

export default function Map() {
  const { user, loading: userLoading } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: schedules, loading: schedulesLoading } = useReadSchedules({
    skip: !user,
  });

  const availableSchedules = useMemo(
    () => schedules?.filter(Boolean) ?? [],
    [schedules]
  );

  const selectedScheduleId = searchParams.get("schedule");

  useEffect(() => {
    if (selectedScheduleId || availableSchedules.length === 0) return;

    const firstSchedule = availableSchedules[0];
    if (firstSchedule) setSearchParams({ schedule: firstSchedule._id });
  }, [availableSchedules, selectedScheduleId, setSearchParams]);

  const { data: scheduleData, loading: scheduleLoading } = useReadSchedule(
    selectedScheduleId ?? "",
    { skip: !selectedScheduleId }
  );

  const schedule = useMemo(() => {
    if (!scheduleData) return undefined;

    return {
      ...scheduleData,
      classes: scheduleData.classes.map((cls, index) => ({
        ...cls,
        color: cls.color ?? getNextClassColor(index),
      })),
      events: scheduleData.events.map((event) => ({
        ...event,
        color: event.color ?? Color.Gray,
      })),
    };
  }, [scheduleData]);

  const selectedSections = useMemo(
    () => getSelectedSections(schedule),
    [schedule]
  );

  if (userLoading || (user && schedulesLoading)) {
    return (
      <div className={styles.centered}>
        <LoadingIndicator size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.centered}>
        <div className={styles.message}>
          <Calendar />
          <h1>Map routes</h1>
          <p>Sign in to choose a schedule and view class-to-class routes.</p>
          <Button onClick={() => signIn()}>
            {import.meta.env.DEV ? "Continue as local dev user" : "Sign in"}
            <ArrowRight />
          </Button>
        </div>
      </div>
    );
  }

  if (availableSchedules.length === 0) {
    return (
      <div className={styles.centered}>
        <div className={styles.message}>
          <Calendar />
          <h1>No schedules yet</h1>
          <p>Create a schedule, add classes, then return here to see routes.</p>
          <Link to="/schedules">
            <Button>
              <Plus />
              Create a schedule
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.selector}>
        <label>
          <span>Schedule</span>
          <select
            value={selectedScheduleId ?? ""}
            onChange={(event) =>
              setSearchParams({ schedule: event.target.value })
            }
          >
            {availableSchedules.map((schedule) => (
              <option key={schedule._id} value={schedule._id}>
                {schedule.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {scheduleLoading || !schedule ? (
        <div className={styles.centered}>
          <LoadingIndicator size="lg" />
        </div>
      ) : (
        <RouteMap selectedSections={selectedSections} />
      )}
    </div>
  );
}
