import { useEffect, useRef, useState } from "react";

import { Plugins, Sortable } from "@shopify/draggable";

import { ICourse, Semester } from "@/lib/api";

import styles from "./Plan.module.scss";
import Term from "./Term";

const defaultTerms: {
  semester: Semester;
  year: number;
  courses: ICourse[];
}[] = [
  {
    semester: Semester.Fall,
    year: 2021,
    courses: [],
  },
  {
    semester: Semester.Spring,
    year: 2022,
    courses: [],
  },
  {
    semester: Semester.Fall,
    year: 2022,
    courses: [],
  },
  {
    semester: Semester.Spring,
    year: 2023,
    courses: [],
  },
  {
    semester: Semester.Fall,
    year: 2023,
    courses: [],
  },
  {
    semester: Semester.Spring,
    year: 2024,
    courses: [],
  },
  {
    semester: Semester.Fall,
    year: 2024,
    courses: [],
  },
];

export default function Plan() {
  const containerRefs = useRef<HTMLElement[]>([]);
  const [terms, setTerms] = useState(defaultTerms);

  const handleClick = (course: ICourse, index: number) => {
    setTerms((terms) => {
      const _terms = structuredClone(terms);
      _terms[index].courses.splice(0, 0, course);
      return _terms;
    });
  };

  const handleRef = (index: number, element: HTMLElement | null) => {
    if (element) containerRefs.current.splice(index, 0, element);
    else containerRefs.current.splice(index, 1);
  };

  useEffect(() => {
    const sortable = new Sortable(containerRefs.current, {
      draggable: `.draggable`,
      distance: 4,
      mirror: {
        constrainDimensions: true,
      },
      plugins: [Plugins.ResizeMirror],
    });

    sortable.on("drag:stop", (event) => {
      event.cancel();
    });

    sortable.on("sortable:stop", (event) => {
      const { oldIndex, newIndex, oldContainer, newContainer } = event;

      if (oldContainer === newContainer && oldIndex === newIndex) return;

      const oldContainerIndex = containerRefs.current.indexOf(oldContainer);
      const newContainerIndex = containerRefs.current.indexOf(newContainer);

      setTerms((terms) => {
        const _terms = structuredClone(terms);

        const course = _terms[oldContainerIndex].courses.splice(oldIndex, 1)[0];

        _terms[newContainerIndex].courses.splice(newIndex, 0, course);

        return _terms;
      });
    });

    return () => {
      sortable.destroy();
    };
  }, []);

  console.log(terms);

  return (
    <div className={styles.root}>
      <div className={styles.sideBar}></div>
      <div className={styles.view}>
        <div className={styles.body}>
          {terms.map(({ semester, year, courses }, index) => (
            <Term
              key={`${semester} ${year}`}
              courses={courses}
              semester={semester}
              year={year}
              onClick={(course) => handleClick(course, index)}
              ref={(element) => handleRef(index, element)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
