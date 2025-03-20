import { Breakpoint, Flex, useBreakpointMatch } from "@repo/theme";

import { IInstructor } from "@/lib/api";

import Location from "../Location";
import Time from "../Time";
import styles from "./Details.module.scss";

interface DetailsProps {
  days: boolean[] | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  instructors: IInstructor[] | null;
}

export default function Details({
  days,
  startTime,
  endTime,
  location,
  instructors,
}: DetailsProps) {
  const breakpointMatch = useBreakpointMatch(Breakpoint.Medium);

  return (
    <Flex direction={{ initial: "column", md: "row" }} gap="4">
      <Flex
        direction="column"
        gap="2"
        flexGrow="1"
        flexShrink="1"
        flexBasis="0"
      >
        <p className={styles.title}>Time</p>
        <Time days={days} startTime={startTime} endTime={endTime} />
      </Flex>
      {breakpointMatch && <div className={styles.divider} />}
      <Flex
        direction="column"
        gap="2"
        flexGrow="1"
        flexShrink="1"
        flexBasis="0"
      >
        <p className={styles.title}>Location</p>
        <Location location={location} />
      </Flex>
      {breakpointMatch && <div className={styles.divider} />}
      <Flex
        direction="column"
        gap="2"
        flexGrow="1"
        flexShrink="1"
        flexBasis="0"
      >
        <p className={styles.title}>
          {instructors && instructors?.length > 1
            ? "Instructors"
            : "Instructor"}
        </p>
        <p
          className={styles.description}
          style={{
            WebkitLineClamp: 2,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
          }}
        >
          {instructors?.[0]
            ? instructors.length === 1
              ? `${instructors[0].givenName} ${instructors[0].familyName}`
              : `${instructors[0].givenName} ${instructors[0].familyName}, et al.`
            : "To be determined"}
        </p>
      </Flex>
    </Flex>
  );
}
