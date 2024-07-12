import { useMemo, useState } from "react";

import { useQuery } from "@apollo/client";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  CalendarPlus,
  GridPlus,
  Heart,
  HeartSolid,
  MoreVert,
  OpenInWindow,
  Xmark,
} from "iconoir-react";

import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import MenuItem from "@/components/MenuItem";
import Tooltip from "@/components/Tooltip";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { GET_COURSE, GetCourseResponse } from "@/lib/api";

import styles from "./Course.module.scss";

interface CourseProps {
  subject: string;
  number: string;
}

export default function Course({ subject, number }: CourseProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const { width } = useWindowDimensions();

  const { data } = useQuery<GetCourseResponse>(GET_COURSE, {
    variables: { subject, number },
  });

  const course = useMemo(() => data?.course, [data]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.row}>
          <div className={styles.group}>
            <Tooltip content={liked ? "Remove like" : "Like course"}>
              <Button
                variant="outline"
                className={classNames(styles.like, { [styles.active]: liked })}
                onClick={() => setLiked(!liked)}
              >
                {liked ? <HeartSolid /> : <Heart />}
                23
              </Button>
            </Tooltip>
            <Tooltip
              content={bookmarked ? "Remove bookmark" : "Bookmark course"}
            >
              <IconButton
                className={classNames(styles.bookmark, {
                  [styles.active]: bookmarked,
                })}
                onClick={() => setBookmarked(!bookmarked)}
              >
                {bookmarked ? <BookmarkSolid /> : <Bookmark />}
              </IconButton>
            </Tooltip>
            {width <= 992 ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <IconButton>
                    <MoreVert />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className={styles.dropdown}
                    sideOffset={8}
                    alignOffset={-5}
                    align="start"
                  >
                    <DropdownMenu.Item className={styles.item}>
                      <OpenInWindow />
                      View course
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.item}>
                      <CalendarPlus />
                      Add class to schedule
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.item}>
                      <GridPlus />
                      Add course to plan
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <>
                <Tooltip content="Add class to schedule">
                  <IconButton>
                    <CalendarPlus />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Add course to plan">
                  <IconButton>
                    <GridPlus />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </div>
          <div className={styles.group}>
            <Tooltip content="Open">
              <IconButton>
                <OpenInWindow />
              </IconButton>
            </Tooltip>
            <Tooltip content="Close">
              <DialogClose asChild>
                <IconButton>
                  <Xmark />
                </IconButton>
              </DialogClose>
            </Tooltip>
          </div>
        </div>
        <DialogTitle asChild>
          <h1 className={styles.heading}>
            {subject} {number}
          </h1>
        </DialogTitle>
        <p className={styles.description}>{course?.title}</p>
      </div>
      <div className={styles.menu}>
        <MenuItem active>Overview</MenuItem>
        <MenuItem>Classes</MenuItem>
        <MenuItem>Enrollment</MenuItem>
        <MenuItem>Grades</MenuItem>
      </div>
    </div>
  );
}
