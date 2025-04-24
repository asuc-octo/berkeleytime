import { useMemo } from "react";

import { Calendar, Plus, Search } from "iconoir-react";

import { Box, Button, Container, Flex } from "@repo/theme";

import Carousel from "@/components/Carousel";
import Footer from "@/components/Footer";
import { useReadSchedules, useReadUser } from "@/hooks/api";
import { ISchedule, signIn } from "@/lib/api";
import { RecentType, getRecents } from "@/lib/recent";

import styles from "./GradTrak.module.scss";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

const SEMESTER_ORDER = ["Spring", "Summer", "Fall"];

export default function GradTrak() {
  const { data: user, loading: userLoading } = useReadUser();

  const { data: schedules, loading: schedulesLoading } = useReadSchedules({
    skip: !user,
  });

  const navigate = useNavigate(); 

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

  const recentSchedules = getRecents(RecentType.Schedule);

  if (userLoading || schedulesLoading) return <></>;

  if (!user) signIn();

  if (!schedules) {
    return <></>;
  }

  return (
    <Box p="5">
      <Container style={{ marginBottom: "80px" }}>
        <div className={styles.header}>
          <div className={styles.title}>
            Welcome to Berkeleytime&apos;s GradTrak
          </div>
          <div className={styles.prompt}>
            Use our GradTrak to build your ideal 4-year plan. 
            insert more text here LOL.
          </div>
            <Button variant="solid" onClick={() => navigate('/gradtrak/onboarding')}>
              <Plus />
              Create a GradTrak
            </Button>
        </div>
        <Flex direction="column" gap="5">
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
        </Flex>
      </Container>
      <Footer />
    </Box>
  );
}
