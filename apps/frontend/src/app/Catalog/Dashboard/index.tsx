import { Dispatch, SetStateAction } from "react";

import {
  ArrowSeparateVertical,
  BookmarkSolid,
  Collapse,
  Expand,
  Search,
} from "iconoir-react";

import { Button, Container, IconButton, Tooltip } from "@repo/theme";

import Carousel from "@/components/Carousel";
import styles from "./Dashboard.module.scss";
import { useReadUser } from "@/hooks/api";
import CarouselClass from "@/components/CarouselClass";
import { ITerm } from "@/lib/api";
import { getRecents } from "@/lib/recents";

interface DashboardProps {
  term: ITerm | null | undefined,
  onSelect: (subject: string, courseNumber: string, number: string) => void;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th'; // applies to 11-20
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function formatDate(date: Date): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const ordinalSuffix = getOrdinalSuffix(day);

  return `${month} ${day}${ordinalSuffix}`;
}


export default function Dashboard({
  term,
  onSelect,
  expanded,
  setExpanded,
  setOpen,
}: DashboardProps) {

  const { data: user, loading: userLoading } = useReadUser();

  if (!term) return <></>

  const recents = getRecents().filter((v) => v.semester == term.semester && v.year == term.year);

  return (
    <div className={styles.root}>
      <Container size="sm">
        <div className={styles.header}>
          <Button>
            <ArrowSeparateVertical />
            Switch terms
          </Button>
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
        <p className={styles.heading}>{term.semester} {term.year}</p>
        {term.startDate && term.endDate ? <p className={styles.paragraph}>{formatDate(new Date(term.startDate))} through {formatDate(new Date(term.endDate!))}</p> : <></> }
        {/* <Carousel title="Upcoming events" Icon={<Calendar />} to="/semesters">
          <div className={styles.card}></div>
          <div className={styles.card}></div>
          <div className={styles.card}></div>
        </Carousel> */}
        <Carousel title="Bookmarked" Icon={<BookmarkSolid />} to="/account">
          {(userLoading || !user) ? <div className={styles.card}>
            <div className={styles.error}>Sign in to bookmark classes</div>
          </div> : user?.bookmarkedClasses.length == 0 ?
            <div className={styles.card}>
              <div className={styles.error}>No bookmarked classes</div>
            </div> :
            user?.bookmarkedClasses.filter((c) => !term || (c.year == term.year && c.semester == term.semester)).map((c, i) => {
              return (<div key={i} className={styles.card}>
                <CarouselClass onSelect={onSelect} subject={c.subject} year={c.year} semester={c.semester} courseNumber={c.courseNumber} number={c.number} />
              </div>)
            })
          }
        </Carousel>
          { recents.length == 0 ?
          <></> :
          <Carousel title="Recently viewed" Icon={<Search />}> {
            recents.filter((c) => !term || (c.year == term.year && c.semester == term.semester)).map((c, i) => {
              return (<div key={i} className={styles.card}>
                <CarouselClass onSelect={onSelect} subject={c.subject} year={c.year} semester={c.semester} courseNumber={c.courseNumber} number={c.number} />
              </div>)
            }) }
          </Carousel>
        }
      </Container>
    </div>
  );
}
