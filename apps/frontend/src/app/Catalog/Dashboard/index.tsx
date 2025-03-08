import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useApolloClient } from "@apollo/client";
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
import ClassCard from "@/components/ClassCard";
import ClassDrawer from "@/components/ClassDrawer";
import { useReadUser } from "@/hooks/api";
import { IClass, ITerm, READ_CLASS, ReadClassResponse } from "@/lib/api";
import { sortByTermDescending } from "@/lib/classes";
import { getRecentClasses } from "@/lib/recent";

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
  const client = useApolloClient();

  const { data: user } = useReadUser();

  const bookmarkedClasses = useMemo(
    () =>
      user?.bookmarkedClasses.filter(
        (bookmarkedClass) =>
          bookmarkedClass.year === term.year &&
          bookmarkedClass.semester === term.semester
      ),
    [term, user]
  );

  const [recentClasses, setRecentClasses] = useState<IClass[]>([]);

  const initialize = useCallback(async () => {
    const recentClasses = getRecentClasses();

    const responses = await Promise.all(
      recentClasses.map(async (recentClass) => {
        const { subject, year, semester, courseNumber, number } = recentClass;

        try {
          const response = await client.query<ReadClassResponse>({
            query: READ_CLASS,
            variables: {
              subject,
              year,
              semester,
              courseNumber,
              number,
            },
          });

          return response.data.class;
        } catch {
          // TODO: Handle errors

          return;
        }
      })
    );

    setRecentClasses(responses.filter((response) => !!response));
  }, [client]);

  useEffect(() => {
    initialize();
  }, [initialize]);

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
            <DropdownMenu.Content sideOffset={5} style={{ maxHeight: 200 }}>
              {terms
                .filter(
                  ({ year, semester }, index) =>
                    index ===
                    terms.findIndex(
                      (term) => term.semester === semester && term.year === year
                    )
                )
                .toSorted(sortByTermDescending)
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
          {/* TODO: Better placeholder states */}
          {!bookmarkedClasses ? (
            <div className={styles.card}>
              <div className={styles.error}>Sign in to bookmark classes</div>
            </div>
          ) : bookmarkedClasses.length === 0 ? (
            <div className={styles.card}>
              <div className={styles.error}>No bookmarked classes</div>
            </div>
          ) : (
            bookmarkedClasses.map((bookmarkedClass, index) => (
              <ClassDrawer {...bookmarkedClass}>
                <Carousel.Item key={index}>
                  <ClassCard class={bookmarkedClass} />
                </Carousel.Item>
              </ClassDrawer>
            ))
          )}
        </Carousel.Root>
        {recentClasses.length > 0 && (
          <Carousel.Root title="Recently viewed" Icon={<Search />}>
            {recentClasses.map((recentClass, index) => (
              <ClassDrawer {...recentClass}>
                <Carousel.Item key={index}>
                  <ClassCard class={recentClass} />
                </Carousel.Item>
              </ClassDrawer>
            ))}
          </Carousel.Root>
        )}
      </Container>
    </div>
  );
}
