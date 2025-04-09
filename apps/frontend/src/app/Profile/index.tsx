import { useMemo, useState } from "react";

import classNames from "classnames";
import { HelpCircle, LogOut, ProfileCircle, Star } from "iconoir-react";
import { Link, useNavigate } from "react-router-dom";

import {
  Flex,
  Text,
} from "@repo/theme";

import Carousel from "@/components/Carousel";
import ClassCard from "@/components/ClassCard";
import ClassDrawer from "@/components/ClassDrawer";

import { useReadSchedules, useReadUser } from "@/hooks/api";
import { ISchedule } from "@/lib/api";

import { signOut } from "@/lib/api";
import { IUser } from "@/lib/api";

import styles from "./Profile.module.scss";

const SEMESTER_ORDER = ["Spring", "Summer", "Fall"];

function YourAccount({ user }: { user: IUser | undefined }) {
  if (!user) return <></>;
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

  return (
    <div>
      <h2>Personal Information</h2>
      <div>
        <div className={styles.infoItem}>
          <label>Full Name</label>
          <span className={styles.infoValue}>
            {user.name}
          </span>
        </div>
        <div className={styles.infoItem}>
          <label>bConnected Email</label>
          <span className={styles.infoValue}>{user.email}</span>
        </div>
        <div className={styles.infoItem}>
          <label>Student Account</label>
          <span className={styles.infoValue}>
            {user.student ? "Yes" : "No"}
          </span>
        </div>
      </div>
      <h2>Bookmarked Classes</h2>  
      <div>
        <Carousel.CarouselNoTitle>
          {/* TODO: Better placeholder states */}
          {user.bookmarkedClasses.length === 0 ? (
            <Carousel.Item>
              <Flex
                align="center"
                justify="center"
                className={styles.placeholder}
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
        <Link to={"/catalog"} className={styles.afterCarouselLink}>
          See all classes
        </Link>
        { schedulesLoading ? <></> : (
          <div>
            <h2>Saved Schedules</h2>
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
                  <Carousel.CarouselNoTitle>
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
                  </Carousel.CarouselNoTitle>
                );
              })}
            <Link to={"/schedules"} className={styles.afterCarouselLink}>
              See all schedules
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function YourRatings() {
  return <div></div>;
}

function Support() {
  return <div></div>;
}

export default function Profile() {
  const { data: user, loading: userLoading } = useReadUser();

  const [activeView, changeActiveView] = useState(0);

  const navigate = useNavigate();

  if (!userLoading && !user) {
    navigate("..");
  }

  return (
    <div className={styles.root}>
      <h1>
        {activeView == 0
          ? "Your Account"
          : activeView == 1
            ? "Your Ratings"
            : "Support"}
      </h1>
      <div className={styles.body}>
        <div className={styles.sidebar}>
          <div
            className={classNames(styles.navItem, {
              [styles.active]: activeView == 0,
            })}
            onClick={() => changeActiveView(0)}
          >
            <ProfileCircle />
            <span>Your Account</span>
          </div>
          <div
            className={classNames(styles.navItem, {
              [styles.active]: activeView == 1,
            })}
            onClick={() => changeActiveView(1)}
          >
            <Star />
            <span>Your Ratings</span>
          </div>
          <div
            className={classNames(styles.navItem, {
              [styles.active]: activeView == 2,
            })}
            onClick={() => changeActiveView(2)}
          >
            <HelpCircle />
            <span>Support</span>
          </div>
          <div className={styles.navItem} onClick={() => signOut()}>
            <LogOut />
            <span>Sign Out</span>
          </div>
        </div>
        {userLoading ? (
          <></>
        ) : activeView == 0 ? (
          <YourAccount user={user} />
        ) : activeView == 1 ? (
          <YourRatings />
        ) : (
          <Support />
        )}
      </div>
    </div>
  );
}
