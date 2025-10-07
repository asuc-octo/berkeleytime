import { BookStack, MoreHoriz, Trash } from "iconoir-react";

import { BadgeLabel, Button, Color, DropdownMenu, Flex } from "@repo/theme";

import { ISelectedCourse, ILabel } from "@/lib/api";

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
  labels: ILabel[];
}

export default function Class({
  cls,
  index,
  handleDragEnd,
  handleDragStart,
  handleDetails,
  handleDelete,
  settings,
  labels,
}: ClassProps) {
  const gradingLabel = cls.pnp ? "PNP" : "GRD";
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
          align={settings.layout === "chart" ? "start" : "center"}
          width="100%"
          className={styles.headerRow}
        >
          <div
            className={
              settings.layout === "chart"
                ? styles.titleBlockChart
                : styles.titleBlockInline
            }
          >
            <h3 className={styles.title}>{cls.courseName}</h3>

            {settings.show[ShowSetting.labels] && cls.labels.length > 0 && (
              <div
                className={
                  settings.layout === "chart"
                    ? styles.labelsContainer
                    : styles.labelsInline
                }
              >
                {cls.labels
                  .filter((l) =>
                    labels.some(
                      (label) => label.name === l.name && label.color === l.color
                    )
                  )
                  .map((l, idx) => (
                    <BadgeLabel key={idx} label={l.name} color={l.color as Color} />
                  ))}
              </div>
            )}
          </div>

          {settings.show[ShowSetting.units] && (
            <p className={styles.unitsText}>
              {cls.courseUnits} Units &bull; {gradingLabel}
            </p>
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
