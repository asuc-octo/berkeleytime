import { useMemo, useState } from "react";

import { EditPencil, Trash } from "iconoir-react";

import { acceptedColors } from "@/app/Schedule/schedule";
import { MenuItem } from "@/components/BubbleCard";
import ClassCard from "@/components/ClassCard";
import ClassDrawer from "@/components/ClassDrawer";
import { ColorDot } from "@/components/ColorDot";
import { ActionMenu } from "@/components/ActionMenu";
import { capitalizeColor } from "@/lib/colors";
import { IScheduleClass, componentMap } from "@/lib/api";
import { Color, Component, Semester } from "@/lib/generated/graphql";

import styles from "./Class.module.scss";
import Section from "./Section";

interface ClassProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  class: IScheduleClass["class"];
  semester: Semester;
  year: number;
  color: Color;
  selectedSections: IScheduleClass["selectedSections"];
  onSectionSelect: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    number: string
  ) => void;
  onSectionMouseOver: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    number: string
  ) => void;
  onSectionMouseOut: () => void;
  onDelete: (cls: IScheduleClass["class"]) => void;
  onColorChange: (
    subject: string,
    courseNumber: string,
    classNumber: string,
    color: Color
  ) => void;
}

export default function Class({
  expanded,
  onExpandedChange,
  class: _class,
  semester,
  year,
  color,
  selectedSections,
  onSectionSelect,
  onSectionMouseOver,
  onSectionMouseOut,
  onDelete,
  onColorChange,
}: ClassProps) {
  const groups = useMemo(() => {
    const sortedSections = _class.sections.toSorted((a, b) =>
      a.number.localeCompare(b.number)
    );

    return Object.groupBy(sortedSections, (section) => section.component);
  }, [_class]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Color submenu
  const colorSubItems: MenuItem[] = acceptedColors.map((c) => ({
    name: capitalizeColor(c as any),
    icon: <ColorDot color={c as any} />,
    onClick: () =>
      onColorChange(_class.subject, _class.courseNumber, _class.number, c),
  }));

  const menuItems: MenuItem[] = [
    {
      name: "Edit color",
      icon: <EditPencil width={18} height={18} />,
      subItems: colorSubItems,
    },
    {
      name: "Delete class",
      icon: <Trash width={18} height={18} />,
      onClick: () => onDelete(_class),
      isDelete: true,
    },
  ];

  return (
    <ClassDrawer
      subject={_class.subject}
      number={_class.number}
      courseNumber={_class.courseNumber}
      year={year}
      semester={semester}
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
    >
      <div
        onClick={(e) => {
          // Only open drawer if not clicking on action areas
          // Action buttons have stopPropagation, so they won't trigger this
          const target = e.target as HTMLElement;
          if (
            target.closest("[data-action-icon]") ||
            target.closest("[data-actions]") ||
            target.closest("[data-color-selector]") ||
            target.closest("[data-action-menu]")
          ) {
            return;
          }
          setDrawerOpen(true);
        }}
        style={{ cursor: "pointer" }}
      >
        <ClassCard
          data-draggable
          class={_class}
          expandable
          expanded={expanded}
          onExpandedChange={onExpandedChange}
          leftBorderColor={color}
          customActionMenu={<ActionMenu menuItems={menuItems} asIcon />}
          wrapDescription={true}
        >
          <div className={styles.group}>
            <div className={styles.label}>
              <p className={styles.component}>
                {_class.primarySection
                  ? componentMap[_class.primarySection.component]
                  : "N/A"}
              </p>
              <p className={styles.time}>Time</p>
            </div>
            {_class.primarySection && (
              <Section
                active={selectedSections.some(
                  (selectedSection) =>
                    selectedSection.sectionId ===
                    _class.primarySection?.sectionId
                )}
                {..._class.primarySection}
                onSectionMouseOver={() =>
                  onSectionMouseOver(
                    _class.subject,
                    _class.courseNumber,
                    _class.number,
                    _class.primarySection?.number
                  )
                }
                onSectionMouseOut={onSectionMouseOut}
                onSectionSelect={() =>
                  onSectionSelect(
                    _class.subject,
                    _class.courseNumber,
                    _class.number,
                    _class.primarySection?.number
                  )
                }
              />
            )}
          </div>
          {Object.keys(groups).map((component) => {
            const group = component as Component;

            return (
              <div className={styles.group} key={component}>
                <div className={styles.label}>
                  <p className={styles.component}>{componentMap[group]}</p>
                  <p className={styles.time}>Time</p>
                </div>
                {groups[group]?.map((section) => {
                  const active = selectedSections.some(
                    (selectedSection) =>
                      selectedSection.sectionId === section.sectionId
                  );

                  return (
                    <Section
                      active={active}
                      onSectionMouseOut={onSectionMouseOut}
                      onSectionMouseOver={() =>
                        onSectionMouseOver(
                          _class.subject,
                          _class.courseNumber,
                          _class.number,
                          section.number
                        )
                      }
                      onSectionSelect={() =>
                        onSectionSelect(
                          _class.subject,
                          _class.courseNumber,
                          _class.number,
                          section.number
                        )
                      }
                      {...section}
                      key={section.sectionId}
                    />
                  );
                })}
              </div>
            );
          })}
        </ClassCard>
      </div>
    </ClassDrawer>
  );
}
