import { useEffect, useMemo, useRef, useState } from "react";

import { IClass, Semester } from "@/lib/api";
import { RecentType, addRecent, getRecents } from "@/lib/recent";

interface UseRecentlyViewedProps {
  classes: IClass[];
  year: number;
  semester: Semester;
  maxRecent?: number;
}

export function useRecentlyViewed({
  classes,
  year,
  semester,
  maxRecent = 3,
}: UseRecentlyViewedProps) {
  const [recentClasses, setRecentClasses] = useState<IClass[]>([]);
  const prevRecentCount = useRef(recentClasses.length);

  useEffect(() => {
    const allRecentClasses = getRecents(RecentType.Class);
    const currentSemesterRecents = allRecentClasses
      .filter((recent) => recent.year === year && recent.semester === semester)
      .slice(0, maxRecent);

    const matchingClasses = currentSemesterRecents
      .map((recent) => {
        return classes.find(
          (cls) =>
            cls.course.subject === recent.subject &&
            cls.course.number === recent.courseNumber &&
            cls.number === recent.number
        );
      })
      .filter((cls): cls is IClass => cls !== undefined);

    setRecentClasses(matchingClasses);
  }, [classes, year, semester, maxRecent]);

  const allClasses = useMemo(() => {
    return [...recentClasses, ...classes];
  }, [recentClasses, classes]);

  const addToRecent = (selectedClass: IClass) => {
    addRecent(RecentType.Class, {
      subject: selectedClass.course.subject,
      year: year,
      semester: semester,
      courseNumber: selectedClass.course.number,
      number: selectedClass.number,
    });

    const currentClass = classes.find(
      (cls) =>
        cls.course.subject === selectedClass.course.subject &&
        cls.course.number === selectedClass.course.number &&
        cls.number === selectedClass.number
    );

    if (currentClass) {
      setRecentClasses((prevRecent) => {
        const filtered = prevRecent.filter(
          (recent) =>
            !(
              recent.course.subject === currentClass.course.subject &&
              recent.course.number === currentClass.course.number &&
              recent.number === currentClass.number
            )
        );
        return [currentClass, ...filtered].slice(0, maxRecent);
      });
    }
  };

  const isRecent = (index: number) => index < recentClasses.length;

  const shouldPreserveScroll = () => {
    const shouldPreserve =
      prevRecentCount.current !== recentClasses.length &&
      recentClasses.length > 0;
    prevRecentCount.current = recentClasses.length;
    return shouldPreserve;
  };

  return {
    recentClasses,
    allClasses,
    addToRecent,
    isRecent,
    shouldPreserveScroll,
  };
}
