import { ComponentPropsWithRef } from "react";

import {
  ArrowSeparateVertical,
  ArrowUnionVertical,
  Bookmark,
  BookmarkSolid,
  Trash,
} from "iconoir-react";

import { Card, Color } from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import EnrollmentDisplay from "@/components/EnrollmentDisplay";
import Units from "@/components/Units";
import { IClass } from "@/lib/api";

import ColorSelector from "../ColorSelector";
import styles from "./ClassCard.module.scss";

interface ClassProps {
  class?: IClass;
  expandable?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onDelete?: () => void;
  leftBorderColor?: Color;
  onColorSelect?: (c: Color) => void;
  bookmarked?: boolean;
  bookmarkToggle?: () => void;
  active?: boolean;
}

export default function ClassCard({
  class: _class,
  expandable = false,
  expanded,
  onExpandedChange,
  onDelete,
  leftBorderColor = undefined,
  onColorSelect = undefined,
  bookmarked = false,
  children,
  bookmarkToggle,
  active = false,
  ...props
}: ClassProps & Omit<ComponentPropsWithRef<"div">, keyof ClassProps>) {
  const gradeDistribution =
    _class?.course?.gradeDistribution ?? _class?.gradeDistribution;

  return (
    <Card.RootColumn
      style={{ overflow: "visible", ...props?.style }}
      active={active}
      {...props}
    >
      <Card.ColumnHeader style={{ overflow: "visible" }}>
        {leftBorderColor && <Card.LeftBorder color={leftBorderColor} />}
        <Card.Body>
          <Card.Heading>
            {_class?.subject ?? _class?.course?.subject}{" "}
            {_class?.courseNumber ?? _class?.course?.number}{" "}
            <span className={styles.sectionNumber}>#{_class?.number}</span>
          </Card.Heading>
          <Card.Description>
            {_class?.title ?? _class?.course?.title}
          </Card.Description>
          <Card.Footer>
            <EnrollmentDisplay
              enrolledCount={
                _class?.primarySection?.enrollment?.latest.enrolledCount
              }
              maxEnroll={_class?.primarySection?.enrollment?.latest.maxEnroll}
              time={_class?.primarySection?.enrollment?.latest.time}
            />
            {_class?.unitsMin !== undefined &&
              _class.unitsMax !== undefined && (
                <Units unitsMin={_class.unitsMin} unitsMax={_class.unitsMax} />
              )}
            {expandable && onExpandedChange !== undefined && (
              <Card.ActionIcon
                onClick={() => {
                  onExpandedChange(!expanded);
                }}
                style={{ position: "absolute", right: 16 }}
              >
                {expanded ? <ArrowUnionVertical /> : <ArrowSeparateVertical />}
              </Card.ActionIcon>
            )}
          </Card.Footer>
        </Card.Body>
        <Card.Actions>
          {gradeDistribution && (
            <AverageGrade
              gradeDistribution={gradeDistribution}
              style={{
                marginTop: 0.5,
                fontSize: 14,
                whiteSpace: "nowrap",
                flexShrink: 0,
                textAlign: "right",
              }}
            />
          )}
          {onDelete && (
            <Card.ActionIcon isDelete onClick={onDelete}>
              <Trash />
            </Card.ActionIcon>
          )}
        </Card.Actions>
      </Card.ColumnHeader>
      {expanded && <Card.ColumnBody>{children}</Card.ColumnBody>}
    </Card.RootColumn>
  );
}
