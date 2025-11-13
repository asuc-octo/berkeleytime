import {
  ReactNode,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import classNames from "classnames";
import {
  Bookmark,
  BookmarkSolid,
  CalendarPlus,
  OpenNewWindow,
  Xmark,
  NavArrowDown,
  Check,
} from "iconoir-react";
import { Checkbox } from "radix-ui";
import { Tabs } from "radix-ui";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Box,
  Container,
  Flex,
  IconButton,
  MenuItem,
  Tooltip,
} from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import CCN from "@/components/CCN";
import EnrollmentDisplay from "@/components/EnrollmentDisplay";
import Units from "@/components/Units";
import ClassContext from "@/contexts/ClassContext";
import { ClassPin } from "@/contexts/PinsContext";
import { useReadCourseForClass, useUpdateUser } from "@/hooks/api";
import { useReadClass } from "@/hooks/api/classes/useReadClass";
import useUser from "@/hooks/useUser";
import { IClass, ICourse, Semester } from "@/lib/api";
import { RecentType, addRecent } from "@/lib/recent";
import { getExternalLink } from "@/lib/section";

import SuspenseBoundary from "../SuspenseBoundary";
import styles from "./Class.module.scss";

const Enrollment = lazy(() => import("./Enrollment"));
const Grades = lazy(() => import("./Grades"));
const Overview = lazy(() => import("./Overview"));
const Sections = lazy(() => import("./Sections"));
const Ratings = lazy(() => import("./Ratings"));

interface BodyProps {
  children: ReactNode;
  dialog?: boolean;
}

function Body({ children, dialog }: BodyProps) {
  return dialog ? children : <Outlet />;
}

interface RootProps {
  dialog?: boolean;
  children: ReactNode;
}

function Root({ dialog, children }: RootProps) {
  return dialog ? (
    <Tabs.Root asChild defaultValue="overview">
      {children}
    </Tabs.Root>
  ) : (
    children
  );
}

interface ControlledProps {
  class: IClass;
  course?: ICourse;
  year?: never;
  semester?: never;
  subject?: never;
  courseNumber?: never;
  number?: never;
}

interface UncontrolledProps {
  class?: never;
  course?: never;
  year: number;
  semester: Semester;
  subject: string;
  courseNumber: string;
  number: string;
}

interface CatalogClassProps {
  dialog?: never;
  onClose: () => void;
}

interface DialogClassProps {
  dialog: true;
  onClose?: never;
}

type ClassProps = (CatalogClassProps | DialogClassProps) &
  (ControlledProps | UncontrolledProps);

export default function Class({
  year,
  semester,
  subject,
  courseNumber,
  number,
  class: providedClass,
  course: providedCourse,
  onClose,
  dialog,
}: ClassProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [updateUser] = useUpdateUser();

  const [showPopup, setShowPopup] = useState(false);
  const [tempThresholds, setTempThresholds] = useState<number[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);
  const bellIconRef = useRef<HTMLDivElement>(null);

  const { data: course, loading: courseLoading } = useReadCourseForClass(
    providedClass?.subject ?? (subject as string),
    providedClass?.courseNumber ?? (courseNumber as string),
    {
      skip: !!providedCourse,
    }
  );

  const { data, loading } = useReadClass(
    year as number,
    semester as Semester,
    subject as string,
    courseNumber as string,
    number as string,
    {
      skip: !!providedClass,
    }
  );

  const _class = useMemo(() => providedClass ?? data, [data, providedClass]);
  const _course = useMemo(
    () => providedCourse ?? course,
    [course, providedCourse]
  );

  const bookmarked = useMemo(
    () =>
      user?.bookmarkedClasses.some(
        (bookmarkedClass) =>
          bookmarkedClass.subject === _class?.subject &&
          bookmarkedClass.courseNumber === _class?.courseNumber &&
          bookmarkedClass.number === _class?.number &&
          bookmarkedClass.year === _class?.year &&
          bookmarkedClass.semester === _class?.semester
      ),
    [user, _class]
  );

  const trackedClassData = useMemo(() => {
    return user?.trackedClasses?.find(
      (trackedClass) =>
        trackedClass.subject === _class.subject &&
        trackedClass.courseNumber === _class.courseNumber &&
        trackedClass.number === _class.number &&
        trackedClass.year === _class.year &&
        trackedClass.semester === _class.semester
    );
  }, [user, _class]);

  const isActive = useMemo(
    () => (trackedClassData?.thresholds.length ?? 0) > 0,
    [trackedClassData]
  );

  useEffect(() => {
    if (showPopup) {
      setTempThresholds(trackedClassData?.thresholds ?? []);
    }
  }, [showPopup, trackedClassData]);

  const handleTempThresholdChange = (threshold: number, checked: boolean) => {
    setTempThresholds((prev) => {
      if (checked) {
        return [...prev, threshold].sort((a, b) => a - b);
      } else {
        return prev.filter((t) => t !== threshold);
      }
    });
  };

  const applyThresholdChanges = useCallback(async () => {
    if (!user || !_class) return;

    const originalThresholds = trackedClassData?.thresholds ?? [];
    const sameLength = originalThresholds.length === tempThresholds.length;
    const sameValues = originalThresholds.every((t) =>
      tempThresholds.includes(t)
    );

    if (sameLength && sameValues) {
      return;
    }

    const otherTrackedClasses = user.trackedClasses.filter(
      (trackedClass) =>
        !(
          trackedClass.subject === _class.subject &&
          trackedClass.courseNumber === _class.courseNumber &&
          trackedClass.number === _class.number &&
          trackedClass.year === _class.year &&
          trackedClass.semester === _class.semester
        )
    );

    let newTrackedClasses;
    if (tempThresholds.length > 0) {
      newTrackedClasses = [
        ...otherTrackedClasses,
        {
          ..._class,
          thresholds: tempThresholds,
        },
      ];
    } else {
      newTrackedClasses = otherTrackedClasses;
    }

    await updateUser(
      {
        trackedClasses: newTrackedClasses.map((tc) => ({
          subject: tc.subject,
          number: tc.number,
          courseNumber: tc.courseNumber,
          year: tc.year,
          semester: tc.semester,
          sessionId: tc.sessionId,
          thresholds: tc.thresholds,
        })),
      },
      {
        optimisticResponse: {
          updateUser: {
            ...user,
            trackedClasses: newTrackedClasses,
          },
        },
      }
    );
  }, [_class, tempThresholds, trackedClassData, updateUser, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        bellIconRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !bellIconRef.current.contains(event.target as Node)
      ) {
        if (showPopup) {
          applyThresholdChanges();
          setShowPopup(false);
        }
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup, applyThresholdChanges]);

  const pin = useMemo(() => {
    if (!_class) return;

    const { year, semester, subject, courseNumber, number } = _class;

    const id = `${year}-${semester}-${subject}-${courseNumber}-${number}`;

    return {
      id,
      type: "class",
      data: {
        year,
        semester,
        subject,
        courseNumber,
        number,
      },
    } as ClassPin;
  }, [_class]);

  const bookmark = useCallback(async () => {
    if (!user || !_class) return;

    const bookmarkedClasses = bookmarked
      ? user.bookmarkedClasses.filter(
          (bookmarkedClass) =>
            !(
              bookmarkedClass.subject === _class?.subject &&
              bookmarkedClass.courseNumber === _class?.courseNumber &&
              bookmarkedClass.number === _class?.number &&
              bookmarkedClass.year === _class?.year &&
              bookmarkedClass.semester === _class?.semester
            )
        )
      : user.bookmarkedClasses.concat(_class);
    await updateUser(
      {
        bookmarkedClasses: bookmarkedClasses.map((bookmarkedClass) => ({
          subject: bookmarkedClass.subject,
          number: bookmarkedClass.number,
          courseNumber: bookmarkedClass.courseNumber,
          year: bookmarkedClass.year,
          semester: bookmarkedClass.semester,
          sessionId: bookmarkedClass.sessionId,
        })),
      },
      {
        optimisticResponse: {
          updateUser: {
            ...user,
            bookmarkedClasses: user.bookmarkedClasses,
          },
        },
      }
    );
  }, [_class, bookmarked, updateUser, user]);

  useEffect(() => {
    if (!_class) return;

    addRecent(RecentType.Class, {
      subject: _class.subject,
      year: _class.year,
      semester: _class.semester,
      courseNumber: _class.courseNumber,
      number: _class.number,
    });
  }, [_class]);

  const ratingsCount = useMemo(() => {
    return (
      _course &&
      _course.aggregatedRatings &&
      _course.aggregatedRatings.metrics.length > 0 &&
      Math.max(
        ...Object.values(_course.aggregatedRatings.metrics.map((v) => v.count))
      )
    );
  }, [_course]);

  const courseGradeDistribution = _class?.course.gradeDistribution;

  const hasCourseGradeSummary = useMemo(() => {
    if (!courseGradeDistribution) return false;

    const average = courseGradeDistribution.average;
    if (typeof average === "number" && Number.isFinite(average)) {
      return true;
    }

    return courseGradeDistribution.distribution?.some((grade) => {
      const count = grade.count ?? 0;
      const percentage = grade.percentage ?? 0;
      return count > 0 || percentage > 0;
    });
  }, [courseGradeDistribution]);

  const handleClose = useCallback(() => {
    if (!_class) return;

    navigate(`/catalog/${_class.year}/${_class.semester}`);

    if (onClose) {
      onClose();
    }
  }, [_class, navigate, onClose]);

  if (loading || courseLoading) {
    return <></>;
  }

  if (!_course || !_class || !pin) {
    return <></>;
  }

  const uniqueId = `${_class.subject}-${_class.number}`;

  return (
    <Root dialog={dialog}>
      <Flex direction="column" flexGrow="1" className={styles.root}>
        <Box className={styles.header} pt="5" px="5">
          <Container size="3">
            <Flex direction="column" gap="5">
              <Flex justify="between" align="start">
                <Flex gap="3" align="center" style={{ position: "relative" }}>
                  <Tooltip
                    content={bookmarked ? "Remove bookmark" : "Bookmark"}
                  >
                    <IconButton
                      className={classNames(styles.bookmark, {
                        [styles.active]: bookmarked,
                      })}
                      onClick={() => bookmark()}
                      disabled={userLoading}
                    >
                      {bookmarked ? <BookmarkSolid /> : <Bookmark />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip content="Add to schedule">
                    <IconButton>
                      <CalendarPlus />
                    </IconButton>
                  </Tooltip>

                  <div
                    ref={bellIconRef}
                    className={`${styles.bellWrapper} ${
                      isActive ? styles.active : ""
                    }`}
                    onClick={() => setShowPopup(!showPopup)}
                  >
                    {isActive ? (
                      <>
                        <CustomBellNotificationIcon width={16} height={16} />
                        <NavArrowDown
                          width={14}
                          height={14}
                          strokeWidth={2.5}
                          style={{ color: "var(--blue-500)" }}
                          className={showPopup ? styles.arrowRotated : ""}
                        />
                      </>
                    ) : (
                      <CustomBellIcon width={16} height={16} />
                    )}
                  </div>

                  {showPopup && (
                    <div ref={popupRef} className={styles.popup}>
                      <div className={styles.checkboxOption}>
                        <Checkbox.Root
                          id={`${uniqueId}-50`}
                          className={styles.checkbox}
                          checked={tempThresholds.includes(50)}
                          onCheckedChange={(checked) =>
                            handleTempThresholdChange(50, checked as boolean)
                          }
                        >
                          <Checkbox.Indicator asChild>
                            <Check width={12} height={12} />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label htmlFor={`${uniqueId}-50`}>
                          <span>When 50% full</span>
                        </label>
                      </div>

                      <div className={styles.checkboxOption}>
                        <Checkbox.Root
                          id={`${uniqueId}-75`}
                          className={styles.checkbox}
                          checked={tempThresholds.includes(75)}
                          onCheckedChange={(checked) =>
                            handleTempThresholdChange(75, checked as boolean)
                          }
                        >
                          <Checkbox.Indicator asChild>
                            <Check width={12} height={12} />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label htmlFor={`${uniqueId}-75`}>
                          <span>When 75% full</span>
                        </label>
                      </div>

                      <div className={styles.checkboxOption}>
                        <Checkbox.Root
                          id={`${uniqueId}-90`}
                          className={styles.checkbox}
                          checked={tempThresholds.includes(90)}
                          onCheckedChange={(checked) =>
                            handleTempThresholdChange(90, checked as boolean)
                          }
                        >
                          <Checkbox.Indicator asChild>
                            <Check width={12} height={12} />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label htmlFor={`${uniqueId}-90`}>
                          <span>When 90% full</span>
                        </label>
                      </div>
                    </div>
                  )}
                </Flex>

                <Flex gap="3">
                  <Tooltip content="Open in Berkeley Catalog">
                    <IconButton
                      as="a"
                      href={getExternalLink(
                        _class.year,
                        _class.semester,
                        _class.subject,
                        _class.courseNumber,
                        _class.primarySection.number,
                        _class.primarySection.component
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <OpenNewWindow />
                    </IconButton>
                  </Tooltip>
                  {onClose && (
                    <Tooltip content="Close">
                      <IconButton onClick={handleClose}>
                        <Xmark />
                      </IconButton>
                    </Tooltip>
                  )}
                </Flex>
              </Flex>

              <Flex direction="column" gap="4">
                <Flex direction="column" gap="1">
                  <h1 className={styles.heading}>
                    {_class.subject} {_class.courseNumber}{" "}
                    <span className={styles.sectionNumber}>
                      #{_class.number}
                    </span>
                  </h1>
                  <p className={styles.description}>
                    {_class.title || _class.course.title}
                  </p>
                </Flex>
                <Flex gap="3" align="center">
                  {hasCourseGradeSummary && (
                    <Link
                      to={`/grades?input=${encodeURIComponent(
                        `${_class.subject};${_class.courseNumber}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <AverageGrade
                        gradeDistribution={_class.course.gradeDistribution}
                      />
                    </Link>
                  )}
                  <EnrollmentDisplay
                    enrolledCount={
                      _class.primarySection.enrollment?.latest.enrolledCount
                    }
                    maxEnroll={
                      _class.primarySection.enrollment?.latest.maxEnroll
                    }
                    time={_class.primarySection.enrollment?.latest.time}
                  >
                    {(content) => (
                      <Link
                        to={`/enrollment?input=${encodeURIComponent(
                          `${_class.subject};${_class.courseNumber};T;${_class.year}:${_class.semester};${_class.number}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none" }}
                      >
                        {content}
                      </Link>
                    )}
                  </EnrollmentDisplay>
                  <Units
                    unitsMax={_class.unitsMax}
                    unitsMin={_class.unitsMin}
                  />
                  {_class && (
                    <CCN sectionId={_class.primarySection.sectionId} />
                  )}
                </Flex>
              </Flex>
              {dialog ? (
                <Tabs.List asChild defaultValue="overview">
                  <Flex mx="-3" mb="3">
                    <Tabs.Trigger value="overview" asChild>
                      <MenuItem>Overview</MenuItem>
                    </Tabs.Trigger>
                    <Tabs.Trigger value="sections" asChild>
                      <MenuItem>Sections</MenuItem>
                    </Tabs.Trigger>
                    <Tabs.Trigger value="grades" asChild>
                      <MenuItem>Grades</MenuItem>
                    </Tabs.Trigger>
                    <NavLink
                      to={`/catalog/${_class.year}/${_class.semester}/${_class.subject}/${_class.courseNumber}/${_class.number}/ratings`}
                    >
                      <MenuItem styl>
                        Ratings
                        {ratingsCount ? (
                          <div className={styles.badge}>{ratingsCount}</div>
                        ) : (
                          <div className={styles.dot}></div>
                        )}
                      </MenuItem>
                    </NavLink>
                  </Flex>
                </Tabs.List>
              ) : (
                <Flex mx="-3" mb="3">
                  <NavLink to={{ ...location, pathname: "." }} end>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Overview</MenuItem>
                    )}
                  </NavLink>
                  <NavLink to={{ ...location, pathname: "sections" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Sections</MenuItem>
                    )}
                  </NavLink>
                  <NavLink to={{ ...location, pathname: "grades" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>Grades</MenuItem>
                    )}
                  </NavLink>
                  <NavLink to={{ ...location, pathname: "ratings" }}>
                    {({ isActive }) => (
                      <MenuItem active={isActive}>
                        Ratings
                        {ratingsCount ? (
                          <div className={styles.badge}>{ratingsCount}</div>
                        ) : (
                          <div className={styles.dot}></div>
                        )}
                      </MenuItem>
                    )}
                  </NavLink>
                </Flex>
              )}
            </Flex>
          </Container>
        </Box>
        <ClassContext
          value={{
            class: _class,
            course: _course,
          }}
        >
          <Body dialog={dialog}>
            {dialog && (
              <>
                <Tabs.Content value="overview" asChild>
                  <SuspenseBoundary>
                    <Overview />
                  </SuspenseBoundary>
                </Tabs.Content>
                <Tabs.Content value="sections" asChild>
                  <SuspenseBoundary>
                    <Sections />
                  </SuspenseBoundary>
                </Tabs.Content>
                <Tabs.Content value="enrollment" asChild>
                  <SuspenseBoundary>
                    <Enrollment />
                  </SuspenseBoundary>
                </Tabs.Content>
                <Tabs.Content value="grades" asChild>
                  <SuspenseBoundary>
                    <Grades />
                  </SuspenseBoundary>
                </Tabs.Content>
                <Tabs.Content value="ratings" asChild>
                  <SuspenseBoundary>
                    <Ratings />
                  </SuspenseBoundary>
                </Tabs.Content>
              </>
            )}
          </Body>
        </ClassContext>
      </Flex>
    </Root>
  );
}

const CustomBellNotificationIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.752 1.91434C14.1218 2.7805 13.75 3.84683 13.75 5C13.75 7.83971 16.0046 10.1528 18.8214 10.247C18.8216 10.2508 18.8219 10.2546 18.8222 10.2583C18.8369 10.4557 18.852 10.6591 18.8726 10.855C19.1087 13.1025 19.6495 14.6443 20.1679 15.6582C20.5132 16.3334 20.8519 16.781 21.0922 17.0516C21.2125 17.1871 21.3088 17.2788 21.3696 17.3328C21.4 17.3599 21.4216 17.3775 21.4329 17.3865L21.4416 17.3933C21.7027 17.5833 21.8131 17.9196 21.7147 18.2278C21.6154 18.5386 21.3265 18.7496 21.0002 18.7496L3.00005 18.75C2.67373 18.75 2.38485 18.539 2.28559 18.2281C2.18718 17.9199 2.29755 17.5837 2.55863 17.3937L2.56735 17.3869C2.57869 17.3779 2.60028 17.3602 2.63069 17.3332C2.69148 17.2792 2.7877 17.1875 2.90804 17.052C3.14835 16.7814 3.48701 16.3338 3.8323 15.6585C4.52142 14.3109 5.25005 12.0306 5.25005 8.4C5.25005 6.51876 5.95021 4.70561 7.21026 3.36156C8.47184 2.01587 10.1937 1.25 12.0001 1.25C12.3823 1.25 12.7613 1.28434 13.1331 1.35139C13.3707 1.39421 14.1514 1.63742 14.752 1.91434Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.25 5C15.25 2.92893 16.9289 1.25 19 1.25C21.0711 1.25 22.75 2.92893 22.75 5C22.75 7.07107 21.0711 8.75 19 8.75C16.9289 8.75 15.25 7.07107 15.25 5Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.89369 20.3514C10.252 20.1435 10.7109 20.2655 10.9188 20.6238C11.0287 20.8132 11.1864 20.9705 11.3761 21.0798C11.5659 21.1891 11.781 21.2466 12 21.2466C12.219 21.2466 12.4342 21.1891 12.6239 21.0798C12.8137 20.9705 12.9714 20.8132 13.0813 20.6238C13.2891 20.2655 13.7481 20.1435 14.1063 20.3514C14.4646 20.5592 14.5866 21.0182 14.3788 21.3765C14.137 21.7932 13.7901 22.1391 13.3726 22.3796C12.9551 22.62 12.4818 22.7466 12 22.7466C11.5183 22.7466 11.0449 22.62 10.6275 22.3796C10.21 22.1391 9.86301 21.7932 9.62127 21.3765C9.41343 21.0182 9.5354 20.5592 9.89369 20.3514Z"
      fill="currentColor"
    />
  </svg>
);

const CustomBellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.752 1.91434C14.1218 2.7805 13.75 3.84683 13.75 5C13.75 7.83971 16.0046 10.1528 18.8214 10.247C18.8216 10.2508 18.8219 10.2546 18.8222 10.2583C18.8369 10.4557 18.852 10.6591 18.8726 10.855C19.1087 13.1025 19.6495 14.6443 20.1679 15.6582C20.5132 16.3334 20.8519 16.781 21.0922 17.0516C21.2125 17.1871 21.3088 17.2788 21.3696 17.3328C21.4 17.3599 21.4216 17.3775 21.4329 17.3865L21.4416 17.3933C21.7027 17.5833 21.8131 17.9196 21.7147 18.2278C21.6154 18.5386 21.3265 18.7496 21.0002 18.7496L3.00005 18.75C2.67373 18.75 2.38485 18.539 2.28559 18.2281C2.18718 17.9199 2.29755 17.5837 2.55863 17.3937L2.56735 17.3869C2.57869 17.3779 2.60028 17.3602 2.63069 17.3332C2.69148 17.2792 2.7877 17.1875 2.90804 17.052C3.14835 16.7814 3.48701 16.3338 3.8323 15.6585C4.52142 14.3109 5.25005 12.0306 5.25005 8.4C5.25005 6.51876 5.95021 4.70561 7.21026 3.36156C8.47184 2.01587 10.1937 1.25 12.0001 1.25C12.3823 1.25 12.7613 1.28434 13.1331 1.35139C13.3707 1.39421 14.1514 1.63742 14.752 1.91434Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.89369 20.3514C10.252 20.1435 10.7109 20.2655 10.9188 20.6238C11.0287 20.8132 11.1864 20.9705 11.3761 21.0798C11.5659 21.1891 11.781 21.2466 12 21.2466C12.219 21.2466 12.4342 21.1891 12.6239 21.0798C12.8137 20.9705 12.9714 20.8132 13.0813 20.6238C13.2891 20.2655 13.7481 20.1435 14.1063 20.3514C14.4646 20.5592 14.5866 21.0182 14.3788 21.3765C14.137 21.7932 13.7901 22.1391 13.3726 22.3796C12.9551 22.62 12.4818 22.7466 12 22.7466C11.5183 22.7466 11.0449 22.62 10.6275 22.3796C10.21 22.1391 9.86301 21.7932 9.62127 21.3765C9.41343 21.0182 9.5354 20.5592 9.89369 20.3514Z"
      fill="currentColor"
    />
  </svg>
);