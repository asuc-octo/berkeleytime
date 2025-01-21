import { Dispatch, SetStateAction } from "react";

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
import CarouselClass from "@/components/CarouselClass";
import { useReadUser } from "@/hooks/api";
import { ITerm } from "@/lib/api";
import { getRecents } from "@/lib/recents";

import styles from "./Dashboard.module.scss";

interface DashboardProps {
  term: ITerm | null | undefined;
  termList: ITerm[] | undefined;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Dashboard({
  term,
  termList,
  expanded,
  setExpanded,
  setOpen,
}: DashboardProps) {
  const { data: user, loading: userLoading } = useReadUser();

  if (!term) return <></>;

  const recents = getRecents().filter(
    (v) => v.semester == term.semester && v.year == term.year
  );

  const navigate = useNavigate();

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
              {termList ? (
                termList
                  .filter(
                    ({ year, semester }, index) =>
                      index ===
                      termList.findIndex(
                        (term) =>
                          term.semester === semester && term.year === year
                      )
                  )
                  .map((t) => {
                    return (
                      <DropdownMenu.Item
                        key={`${t.semester} ${t.year}`}
                        onClick={() =>
                          navigate(`/catalog/${t.year}/${t.semester}`)
                        }
                      >
                        {t.semester} {t.year}
                      </DropdownMenu.Item>
                    );
                  })
              ) : (
                <></>
              )}
              <DropdownMenu.Arrow style={{ fill: "var(--foreground-color)" }} />
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
        {term.startDate && term.endDate ? (
          <p className={styles.paragraph}>
            {moment(term.startDate).format("MMMM Do")} through{" "}
            {moment(term.endDate).format("MMMM Do")}
          </p>
        ) : (
          <></>
        )}
        {/* <Carousel title="Upcoming events" Icon={<Calendar />} to="/semesters">
          <div className={styles.card}></div>
          <div className={styles.card}></div>
          <div className={styles.card}></div>
        </Carousel> */}
        <Carousel title="Bookmarked" Icon={<BookmarkSolid />} to="/account">
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
                (c) =>
                  !term || (c.year == term.year && c.semester == term.semester)
              )
              .map((c, i) => {
                return (
                  <div key={i} className={styles.card}>
                    <CarouselClass
                      subject={c.subject}
                      year={c.year}
                      semester={c.semester}
                      courseNumber={c.courseNumber}
                      number={c.number}
                    />
                  </div>
                );
              })
          )}
        </Carousel>
        {recents.length !== 0 && (
          <Carousel title="Recently viewed" Icon={<Search />}>
            {" "}
            {recents
              .filter(
                (c) =>
                  !term || (c.year == term.year && c.semester == term.semester)
              )
              .reverse()
              .map((c, i) => {
                return (
                  <div key={i} className={styles.card}>
                    <CarouselClass
                      subject={c.subject}
                      year={c.year}
                      semester={c.semester}
                      courseNumber={c.courseNumber}
                      number={c.number}
                    />
                  </div>
                );
              })}
          </Carousel>
        )}
      </Container>
    </div>
  );
}
