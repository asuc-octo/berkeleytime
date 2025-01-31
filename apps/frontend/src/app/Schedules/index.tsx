import { useMemo } from "react";

import { Calendar, Search } from "iconoir-react";

import { Button, Container } from "@repo/theme";

import Carousel from "@/components/Carousel";
import Footer from "@/components/Footer";
import { useReadSchedules, useReadUser } from "@/hooks/api";
import { ISchedule, signIn } from "@/lib/api";
import { getRecentSchedules } from "@/lib/recent";

import CreateScheduleDialog from "./CreateScheduleDialog";
import styles from "./Schedules.module.scss";

const SEMESTER_ORDER = ["Spring", "Summer", "Fall"];

export default function Schedules() {
  const { data: user, loading: userLoading } = useReadUser();

  const { data: schedules, loading: schedulesLoading } = useReadSchedules({
    skip: !user,
  });

  const schedulesBySemester = useMemo(() => {
    return schedules
      ? schedules.reduce(
          (acc, schedule) => {
            const term = `${schedule.semester} ${schedule.year}`;
            if (!acc[term]) acc[term] = [];
            acc[term].push(schedule);
            return acc;
          },
          {} as { [key: string]: ISchedule[] }
        )
      : ({} as { [key: string]: ISchedule[] });
  }, [schedules]);

  const recentSchedules = getRecentSchedules();

  if (userLoading || schedulesLoading) return <></>;

  if (!user) signIn();

  if (!schedules) {
    return <></>;
  }

  return (
    <div>
      <Container style={{ marginBottom: "80px" }}>
        <div className={styles.header}>
          <div className={styles.title}>
            Welcome to Berkeleytime&apos;s Scheduler
          </div>
          <div className={styles.prompt}>
            Use our scheduler to build your ideal schedule. Search our catalog
            to add new classes or select from saved ones, and add your own time
            preferences.
          </div>
          <CreateScheduleDialog
            defaultName={`Schedule ${schedules.length + 1}`}
          >
            <Button variant="solid">Create Schedule</Button>
          </CreateScheduleDialog>
        </div>
        <div className={styles.schedulesCont}>
          {recentSchedules.length !== 0 && (
            <Carousel.Root title="Recently viewed" Icon={<Search />}>
              {recentSchedules.map(
                ({ _id, name, classes, year, semester }, i) => {
                  return (
                    <Carousel.Schedule
                      key={i}
                      _id={_id}
                      name={name}
                      classes={classes}
                      semester={`${semester} ${year}`}
                    />
                  );
                }
              )}
            </Carousel.Root>
          )}
          {Object.keys(schedulesBySemester)
            .sort((a, b) => {
              return schedulesBySemester[a][0].year ==
                schedulesBySemester[b][0].year
                ? SEMESTER_ORDER.indexOf(schedulesBySemester[b][0].semester) -
                    SEMESTER_ORDER.indexOf(schedulesBySemester[a][0].semester)
                : schedulesBySemester[b][0].year -
                    schedulesBySemester[a][0].year;
            })
            .map((sem) => {
              return (
                <Carousel.Root key={sem} title={sem} Icon={<Calendar />}>
                  {schedulesBySemester[sem].map(({ _id, name, classes }, i) => {
                    return (
                      <Carousel.Schedule
                        key={i}
                        _id={_id}
                        name={name}
                        classes={classes}
                      />
                    );
                  })}
                </Carousel.Root>
              );
            })}
        </div>
      </Container>
      <Footer />
    </div>
  );
}
