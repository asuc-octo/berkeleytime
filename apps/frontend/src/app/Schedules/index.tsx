import { useMemo } from "react";

import { ArrowRight, Calendar, Plus } from "iconoir-react";

import { Box, Button, Container, Flex } from "@repo/theme";

import Footer from "@/components/Footer";
import ScheduleCard from "@/components/ScheduleCard";
import { useReadSchedules, useReadTerms } from "@/hooks/api";
import useUser from "@/hooks/useUser";
import { IScheduleListSchedule, signIn } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

// import { RecentType, getRecents } from "@/lib/recent";

import CreateScheduleDialog from "./CreateScheduleDialog";
import styles from "./Schedules.module.scss";

const SEMESTER_ORDER = ["Spring", "Summer", "Fall"];

export default function Schedules() {
  const { user, loading: userLoading } = useUser();

  const { data: schedules, loading: schedulesLoading } = useReadSchedules({
    skip: !user,
  });

  const { data: terms } = useReadTerms();

  const sessionIdToName = useMemo(() => {
    const map = new Map<string, string>();
    terms?.forEach((term) => {
      term.sessions?.forEach((session) => {
        map.set(session.id, session.name);
      });
    });
    return map;
  }, [terms]);

  const schedulesBySemester = useMemo(() => {
    return schedules
      ? schedules.reduce(
          (acc, schedule) => {
            if (!schedule) return acc;
            const isSummer = schedule.semester === Semester.Summer;
            const term =
              isSummer && schedule.sessionId
                ? `${schedule.semester} ${schedule.year} - ${sessionIdToName.get(schedule.sessionId) || schedule.sessionId}`
                : `${schedule.semester} ${schedule.year}`;
            if (!acc[term]) acc[term] = [];
            acc[term].push(schedule);
            return acc;
          },
          {} as { [key: string]: IScheduleListSchedule[] }
        )
      : ({} as { [key: string]: IScheduleListSchedule[] });
  }, [schedules, sessionIdToName]);

  // const recentSchedules = getRecents(RecentType.Schedule);

  if (userLoading) return <></>;

  if (user && (schedulesLoading || !schedules)) {
    return <></>;
  }

  return (
    <Box p="5">
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
          {user ? (
            <CreateScheduleDialog
              defaultName={`Schedule ${schedules?.length ? schedules.length + 1 : 1}`}
            >
              <Button>
                <Plus />
                Create a schedule
              </Button>
            </CreateScheduleDialog>
          ) : (
            <Button onClick={() => signIn()}>
              Sign in
              <ArrowRight />
            </Button>
          )}
        </div>
        <Flex direction="column" gap="5">
          {/* TODO: Removed recent schedules. Delete doesn't work and # a user would have is too small to justify this?
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
          )} */}
          {Object.keys(schedulesBySemester)
            .sort((a, b) => {
              if (!schedulesBySemester[a][0]) return -1;
              if (!schedulesBySemester[b][0]) return 1;

              const scheduleA = schedulesBySemester[a][0];
              const scheduleB = schedulesBySemester[b][0];

              // Compare by year first
              if (scheduleA.year !== scheduleB.year) {
                return scheduleB.year - scheduleA.year;
              }

              // If same year, compare by semester
              const semesterDiff =
                SEMESTER_ORDER.indexOf(scheduleB.semester) -
                SEMESTER_ORDER.indexOf(scheduleA.semester);

              if (semesterDiff !== 0) {
                return semesterDiff;
              }

              // If both are Summer terms with same year, sort by sessionId in reverse order
              if (
                scheduleA.semester === Semester.Summer &&
                scheduleB.semester === Semester.Summer &&
                scheduleA.sessionId &&
                scheduleB.sessionId
              ) {
                return scheduleB.sessionId.localeCompare(scheduleA.sessionId);
              }

              return 0;
            })
            .map((sem) => {
              return (
                <div key={sem} className={styles.semesterSection}>
                  <div className={styles.semesterTitle}>
                    <div className={styles.semesterIcon}>
                      <Calendar />
                    </div>
                    {sem}
                  </div>
                  <div className={styles.grid}>
                    {schedulesBySemester[sem].map((schedule, i) => {
                      if (!schedule) return null;
                      return (
                        <ScheduleCard
                          key={i}
                          _id={schedule._id}
                          name={schedule.name}
                          schedule={schedule}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </Flex>
      </Container>
      <Footer />
    </Box>
  );
}
