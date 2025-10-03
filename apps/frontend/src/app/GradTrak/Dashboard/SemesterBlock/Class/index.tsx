import { BookStack, MoreHoriz, Trash } from "iconoir-react";

import { BadgeLabel, Button, Color, DropdownMenu, Flex } from "@repo/theme";

import { ISelectedCourse } from "@/lib/api";

import { GradTrakSettings, ShowSetting } from "../../settings";
import styles from "./Class.module.scss";

interface ClassProps {
  cls: ISelectedCourse;
  index: number;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDragStart: (e: React.DragEvent, classIndex: number) => void;
  handleDetails: (index: number) => void;
  handleDelete: (index: number) => void;
  settings: GradTrakSettings;
}

export default function Class({
  cls,
  index,
  handleDragEnd,
  handleDragStart,
  handleDetails,
  handleDelete,
  settings,
}: ClassProps) {
  return (
    <div
      key={index}
      data-class-container
      className={styles.classContainer}
      draggable={true}
      onDragStart={(e) => handleDragStart(e, index)}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.start}>
        <Flex
          direction={settings.layout === "chart" ? "column" : "row"}
          justify="between"
          width="100%"
        >
          <h3 className={styles.title}>{cls.courseName}</h3>
          {settings.show[ShowSetting.units] && <p>{cls.courseUnits} Units</p>}
          {settings.show[ShowSetting.labels] && (
            <div
              className={styles.labelsContainer}
              style={{ marginTop: settings.layout === "grid" ? "0" : "8px" }}
            >
              {cls.labels.map((l, idx) => (
                <BadgeLabel key={idx} label={l.name} color={l.color as Color} />
              ))}
            </div>
          )}
        </Flex>
        <div className={styles.dropdown}>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button className={styles.trigger}>
                <MoreHoriz className={styles.moreHoriz} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content sideOffset={5} align="end">
              <DropdownMenu.Item onClick={() => handleDetails(index)}>
                <BookStack className={styles.menuIcon} /> Edit Details
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => handleDelete(index)} isDelete>
                <Trash className={styles.menuIcon} /> Delete Class
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* <div className={styles.tag}>
    <Book className={styles.icon}/>
    Major
  </div> */}
    </div>
  );
}
