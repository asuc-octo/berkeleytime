import classNames from "classnames";
import { BookStack, MoreHoriz, Trash } from "iconoir-react";

import { Badge, Button, Color, DropdownMenu, Flex } from "@repo/theme";

import { ILabel, ISelectedCourse } from "@/lib/api";

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
  draggable?: boolean;
  /** Compact horizontal card for the bottom Miscellaneous dock (Figma: CODE | N Units - grade) */
  variant?: "default" | "strip";
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
  draggable = true,
  variant = "default",
}: ClassProps) {
  const gradingLabel = cls.pnp ? "PNP" : "GRD";

  if (variant === "strip") {
    const showUnits = settings.show[ShowSetting.units];
    const showGrading = settings.show[ShowSetting.grading];
    const showLabels =
      settings.show[ShowSetting.labels] && cls.labels.length > 0;
    return (
      <div
        key={index}
        data-class-container
        className={classNames(
          styles.classContainer,
          styles.classContainerStrip
        )}
        draggable={draggable}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.stripRow}>
          <div className={styles.stripMain}>
            <h3 className={styles.stripTitle}>{cls.courseName}</h3>
            {(showUnits || showGrading) && (
              <span className={styles.stripSep} aria-hidden>
                |
              </span>
            )}
            <span className={styles.stripMeta}>
              {showUnits && <>{cls.courseUnits} Units</>}
              {showUnits && showGrading && " - "}
              {showGrading && <>{gradingLabel}</>}
            </span>
          </div>
          <div className={classNames(styles.dropdown, styles.stripDropdown)}>
            <DropdownMenu.Root modal={false}>
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
        {showLabels && (
          <div className={styles.stripLabels}>
            {cls.labels
              .filter((l) =>
                labels.some(
                  (label) => label.name === l.name && label.color === l.color
                )
              )
              .map((l, idx) => (
                <Badge key={idx} label={l.name} color={l.color as Color} />
              ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      key={index}
      data-class-container
      className={styles.classContainer}
      draggable={draggable}
      onDragStart={(e) => handleDragStart(e, index)}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.start}>
        <Flex
          direction={settings.layout === "chart" ? "column" : "row"}
          justify="between"
          align={settings.layout === "chart" ? "start" : "center"}
          width="100%"
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
                      (label) =>
                        label.name === l.name && label.color === l.color
                    )
                  )
                  .map((l, idx) => (
                    <Badge key={idx} label={l.name} color={l.color as Color} />
                  ))}
              </div>
            )}
          </div>

          {(settings.show[ShowSetting.units] ||
            settings.show[ShowSetting.grading]) && (
            <p className={styles.unitsText}>
              {settings.show[ShowSetting.units] && <>{cls.courseUnits} Units</>}
              {settings.show[ShowSetting.units] &&
                settings.show[ShowSetting.grading] && <> &bull; </>}
              {settings.show[ShowSetting.grading] && gradingLabel}
            </p>
          )}
        </Flex>

        <div className={styles.dropdown}>
          <DropdownMenu.Root modal={false}>
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
