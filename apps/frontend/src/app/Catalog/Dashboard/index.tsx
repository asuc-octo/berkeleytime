import { Dispatch, SetStateAction, useMemo } from "react";

import {
  ArrowSeparateVertical,
  BookmarkSolid,
  Collapse,
  Expand,
  Search,
} from "iconoir-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import { Button, Container, IconButton, Tooltip } from "@repo/theme";
import { DropdownMenu } from "@repo/theme";

import Carousel from "@/components/Carousel";
import { useReadUser } from "@/hooks/api";
import { ITerm } from "@/lib/api";
import { getRecentClasses } from "@/lib/recent-classes";

import styles from "./Dashboard.module.scss";

interface DashboardProps {
  term: ITerm;
  terms: ITerm[];
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Dashboard({
  term,
  terms,
  expanded,
  setExpanded,
  setOpen,
}: DashboardProps) {
  const navigate = useNavigate();
  const { data: user, loading: userLoading } = useReadUser();

  const recentClasses = useMemo(
    () =>
      getRecentClasses().filter(
        (recentClass) =>
          recentClass.semester === term.semester &&
          recentClass.year === term.year
      ),
    [term]
  );

  return (
    <div className={styles.root}>
      <Container size="sm">
        <div className={styles.header}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button>
                <ArrowSeparateVertical />
                Switch terms
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content sideOffset={5}>
              {terms
                .filter(
                  ({ year, semester }) =>
                    year !== term.year || semester !== term.semester
                )
                .map(({ year, semester }) => {
                  return (
                    <DropdownMenu.Item
                      key={`${semester} ${year}`}
                      onClick={() => navigate(`/catalog/${year}/${semester}`)}
                    >
                      {semester} {year}
                    </DropdownMenu.Item>
                  );
                })}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <div className={styles.toggle}>
            <Button variant="solid" onClick={() => setOpen(false)}>
              Search
              <Search />
            </Button>
            <Tooltip content={expanded ? "Expand" : "Collapse"}>
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <Expand /> : <Collapse />}
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <p className={styles.heading}>
          {term.semester} {term.year}
        </p>
        {term.startDate && term.endDate && (
          <p className={styles.paragraph}>
            {moment(term.startDate).format("MMMM Do")} through{" "}
            {moment(term.endDate).format("MMMM Do")}
          </p>
        )}
        <Carousel.Root
          title="Bookmarked"
          Icon={<BookmarkSolid />}
          to="/account"
        >
          {userLoading || !user ? (
            <div className={styles.card}>
              <div className={styles.error}>Sign in to bookmark classes</div>
            </div>
          ) : user?.bookmarkedClasses.length == 0 ? (
            <div className={styles.card}>
              <div className={styles.error}>No bookmarked classes</div>
            </div>
          ) : (
            user?.bookmarkedClasses
              .filter(
                (bookmarkedClass) =>
                  bookmarkedClass.year === term.year &&
                  bookmarkedClass.semester === term.semester
              )
              .map((bookmarkedClass, i) => {
                return (
                  <Carousel.Class
                    key={i}
                    subject={bookmarkedClass.subject}
                    year={bookmarkedClass.year}
                    semester={bookmarkedClass.semester}
                    courseNumber={bookmarkedClass.courseNumber}
                    number={bookmarkedClass.number}
                  />
                );
              })
          )}
        </Carousel.Root>
        {recentClasses.length !== 0 && (
          <Carousel.Root title="Recently viewed" Icon={<Search />}>
            {recentClasses.map(
              ({ subject, year, semester, courseNumber, number }, i) => {
                return (
                  <Carousel.Class
                    key={i}
                    subject={subject}
                    year={year}
                    semester={semester}
                    courseNumber={courseNumber}
                    number={number}
                  />
                );
              }
            )}
          </Carousel.Root>
        )}
      </Container>
    </div>
  );
}
