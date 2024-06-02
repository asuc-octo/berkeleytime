import Button from "@/components/Button";
import { IClass, ICourse, ISection } from "@/lib/api";

import Catalog from "./Catalog";
import Class from "./Class";
import styles from "./SideBar.module.scss";

interface SideBarProps {
  classes: IClass[];
  selectedSections: ISection[];
  expanded: boolean[];
  onClassSelect: (course: ICourse, number: string) => void;
  onSectionSelect: (section: ISection) => void;
  onSectionMouseOver: (section: ISection) => void;
  onSectionMouseOut: () => void;
  onExpandedChange: (index: number, expanded: boolean) => void;
}

export default function SideBar({
  classes,
  selectedSections,
  onClassSelect,
  expanded,
  onSectionSelect,
  onSectionMouseOver,
  onSectionMouseOut,
  onExpandedChange,
}: SideBarProps) {
  return (
    <div className={styles.root}>
      <Catalog onClassSelect={onClassSelect} semester="Spring" year={2024}>
        <Button>Add class</Button>
      </Catalog>
      {classes.map((class_, index) => {
        const filteredSections = selectedSections.filter(
          (section) =>
            section.course.number === class_.course.number &&
            section.class.number === class_.number &&
            section.course.subject === class_.course.subject
        );

        return (
          <Class
            key={class_.primarySection.ccn}
            {...class_}
            expanded={expanded[index]}
            onExpandedChange={(expanded) => onExpandedChange(index, expanded)}
            onSectionSelect={onSectionSelect}
            onSectionMouseOver={onSectionMouseOver}
            onSectionMouseOut={onSectionMouseOut}
            selectedSections={filteredSections}
          />
        );
      })}
    </div>
  );
}
