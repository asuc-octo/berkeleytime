import { useMemo } from "react";

import { useQuery } from "@apollo/client/react";
import { Calendar } from "iconoir-react";
import { Link } from "react-router-dom";

import { Flex, Text } from "@repo/theme";

import Carousel from "@/components/Carousel";
import ClassCard from "@/components/ClassCard";
import ClassDrawer from "@/components/ClassDrawer";
import ScheduleCard from "@/components/ScheduleCard";
import { useReadSchedules } from "@/hooks/api";
import useUser from "@/hooks/useUser";
import { IScheduleListSchedule } from "@/lib/api";
import { MY_COLLECTIONS } from "@/lib/api/collection";

import styles from "./Account.module.scss";

const SEMESTER_ORDER = ["Spring", "Summer", "Fall"];

export default function Account() {
  const { user } = useUser();

  const { data, loading, error, refetch } = useQuery(MY_COLLECTIONS, {
    fetchPolicy: "cache-and-network",
  });
  console.log(data, loading, error, refetch); // to get rid of an error about not using them

  const { data: schedules, loading: schedulesLoading } = useReadSchedules({
    skip: !user,
  });

  const schedulesBySemester = useMemo(() => {
    return schedules
      ? schedules.reduce(
          (acc, schedule) => {
            if (!schedule) return acc;
            const term = `${schedule.semester} ${schedule.year}`;
            if (!acc[term]) acc[term] = [];
            acc[term].push(schedule);
            return acc;
          },
          {} as { [key: string]: IScheduleListSchedule[] }
        )
      : ({} as { [key: string]: IScheduleListSchedule[] });
  }, [schedules]);

  return (
    <div>
      <h1>Your Account</h1>
      <h2>Personal Information</h2>
      <div>
        <div className={styles.infoItem}>
          <label>Full Name</label>
          <span className={styles.infoValue}>{user?.name}</span>
        </div>
        <div className={styles.infoItem}>
          <label>bConnected Email</label>
          <span className={styles.infoValue}>{user?.email}</span>
        </div>
        <div className={styles.infoItem}>
          <label>Student Account</label>
          <span className={styles.infoValue}>
            {user?.student ? "Yes" : "No"}
          </span>
        </div>
      </div>
      <h2>Bookmarked Classes (Collections Test)</h2>
      <div></div>
      <h2>Bookmarked Classes</h2>
      <div>
        {user && (
          <Carousel.CarouselNoTitle>
            {/* TODO: Update placeholder here alongside dashboard placeholder */}
            {user.bookmarkedClasses.length === 0 ? (
              <Carousel.Item>
                <Flex
                  align="center"
                  justify="center"
                  className={styles.classesPlaceholder}
                >
                  <Text>No bookmarked classes</Text>
                </Flex>
              </Carousel.Item>
            ) : (
              user.bookmarkedClasses.map((bookmarkedClass, index) => (
                <Carousel.Item key={index}>
                  <ClassDrawer {...bookmarkedClass}>
                    <ClassCard class={bookmarkedClass} />
                  </ClassDrawer>
                </Carousel.Item>
              ))
            )}
          </Carousel.CarouselNoTitle>
        )}
        <Link to={"/catalog"} className={styles.afterCarouselLink}>
          View Catalog
        </Link>
        {schedulesLoading || !user ? (
          <></>
        ) : (
          <div>
            <h2>Saved Schedules</h2>
            {/* TODO: Improve this placeholder also */}
            {Object.keys(schedulesBySemester).length == 0 ? (
              <Carousel.Item>
                <Flex
                  align="center"
                  justify="center"
                  className={styles.schedulesPlaceholder}
                >
                  <Text>No saved schedules</Text>
                </Flex>
              </Carousel.Item>
            ) : (
              <Flex direction="column" gap="5">
                {Object.keys(schedulesBySemester)
                  .sort((a, b) => {
                    if (!schedulesBySemester[a][0]) return -1;
                    if (!schedulesBySemester[b][0]) return 1;
                    return schedulesBySemester[a][0].year ==
                      schedulesBySemester[b][0].year
                      ? SEMESTER_ORDER.indexOf(
                          schedulesBySemester[b][0].semester
                        ) -
                          SEMESTER_ORDER.indexOf(
                            schedulesBySemester[a][0].semester
                          )
                      : schedulesBySemester[b][0].year -
                          schedulesBySemester[a][0].year;
                  })
                  .map((sem) => {
                    return (
                      <Carousel.Root key={sem} title={sem} Icon={<Calendar />}>
                        {schedulesBySemester[sem] &&
                          schedulesBySemester[sem].map((schedule, i) => {
                            if (!schedule) return null;
                            return (
                              <Carousel.Item>
                                <ScheduleCard
                                  key={i}
                                  _id={schedule._id}
                                  name={schedule.name}
                                  classes={schedule.classes}
                                />
                              </Carousel.Item>
                            );
                          })}
                      </Carousel.Root>
                    );
                  })}
              </Flex>
            )}
            <Link to={"/schedules"} className={styles.afterCarouselLink}>
              See all schedules
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
