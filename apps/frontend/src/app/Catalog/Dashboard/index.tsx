import { Dispatch, SetStateAction } from "react";

import {
  ArrowSeparateVertical,
  BookmarkSolid,
  Calendar,
  Collapse,
  Expand,
  Search,
} from "iconoir-react";

import { Button, Container, IconButton, Tooltip } from "@repo/theme";

import Carousel from "./Carousel";
import styles from "./Dashboard.module.scss";

interface DashboardProps {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Dashboard({
  expanded,
  setExpanded,
  setOpen,
}: DashboardProps) {
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
        <p className={styles.heading}>Summer 2024</p>
        <p className={styles.paragraph}>March 20th through August 9th</p>
        <Carousel title="Recently viewed" Icon={<Search />}>
          <div className={styles.card}></div>
          <div className={styles.card}></div>
          <div className={styles.card}></div>
        </Carousel>
        <Carousel title="Upcoming events" Icon={<Calendar />} to="/semesters">
          <div className={styles.card}></div>
          <div className={styles.card}></div>
          <div className={styles.card}></div>
        </Carousel>
        <Carousel title="Bookmarked" Icon={<BookmarkSolid />} to="/account">
          <div className={styles.card}></div>
          <div className={styles.card}></div>
          <div className={styles.card}></div>
        </Carousel>
      </Container>
    </div>
  );
}
