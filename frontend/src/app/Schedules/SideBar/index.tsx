import { Dispatch, SetStateAction, useCallback, useState } from "react";

import { useApolloClient } from "@apollo/client";

import Button from "@/components/Button";
import { GET_CLASS, ICatalogCourse, IClass } from "@/lib/api";

import Catalog from "./Catalog";
import Class from "./Class";
import styles from "./SideBar.module.scss";

interface SideBarProps {
  classes: IClass[];
  setClasses: Dispatch<SetStateAction<IClass[]>>;
}

export default function SideBar({ classes, setClasses }: SideBarProps) {
  const apolloClient = useApolloClient();
  const [expandedClasses, setExpandedClasses] = useState<boolean[]>([]);

  const setClass = useCallback(
    async (course: ICatalogCourse, number: string) => {
      const { data } = await apolloClient.query<{ class: IClass }>({
        query: GET_CLASS,
        variables: {
          term: {
            semester: "Spring",
            year: 2024,
          },
          subject: course.subject,
          courseNumber: course.number,
          classNumber: number,
        },
      });

      if (!data) return;

      setExpandedClasses((expandedClasses) => [true, ...expandedClasses]);

      setClasses((classes) => [...classes, data?.class]);
    },
    [apolloClient, setClasses]
  );

  const setExpanded = (index: number, expanded: boolean) => {
    setExpandedClasses((expandedClasses) => {
      const _expandedClasses = structuredClone(expandedClasses);
      _expandedClasses[index] = expanded;
      return _expandedClasses;
    });
  };

  return (
    <div className={styles.root}>
      <Catalog onClick={setClass} semester="Spring" year={2024}>
        <Button>Add class</Button>
      </Catalog>
      {classes.map((_class, index) => (
        <Class
          key={`${_class.course.subject} ${_class.course.number} ${_class.number}`}
          {..._class}
          expanded={expandedClasses[index]}
          setExpanded={(expanded) => setExpanded(index, expanded)}
        />
      ))}
    </div>
  );
}
