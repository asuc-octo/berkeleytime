import { ComponentPropsWithRef } from "react";

import {
  ArrowSeparateVertical,
  ArrowUnionVertical,
  Bookmark,
  BookmarkSolid,
  InfoCircle,
  Trash,
} from "iconoir-react";
import { Tooltip } from "radix-ui";

import { Card } from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import EnrollmentDisplay from "@/components/EnrollmentDisplay";
import Units from "@/components/Units";
import { IClass, IClassCourse } from "@/lib/api";
import { IEnrollmentSingular } from "@/lib/api/enrollment";
import { Color } from "@/lib/generated/graphql";

import ColorSelector from "../ColorSelector";
import styles from "./ClassCard.module.scss";

const formatClassNumber = (number: string | undefined | null): string => {
  if (!number) return "";
  const num = parseInt(number, 10);
  if (isNaN(num)) return number;
  // If > 99, show as-is. Otherwise pad to 2 digits with leading zeros
  if (num > 99) return num.toString();
  return num.toString().padStart(2, "0");
};

type BaseClassFields = Pick<
  IClass,
  | "subject"
  | "courseNumber"
  | "number"
  | "title"
  | "unitsMax"
  | "unitsMin"
  | "gradeDistribution"
>;

type CourseSummary = Pick<IClassCourse, "title" | "gradeDistribution">;

type EnrollmentSnapshot = Pick<
  IEnrollmentSingular,
  "enrolledCount" | "maxEnroll" | "endTime" | "hasReservedSeating"
>;

type ClassCardClass = Partial<BaseClassFields> & {
  course?: Partial<CourseSummary> | null;
  primarySection?: {
    enrollment?: {
      latest?: Partial<EnrollmentSnapshot> | null;
    } | null;
  } | null;
};

interface ClassProps {
  class?: ClassCardClass;
  expandable?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onDelete?: () => void;
  leftBorderColor?: Color;
  onColorSelect?: (c: Color) => void;
  bookmarked?: boolean;
  bookmarkToggle?: () => void;
  active?: boolean;
  wrapDescription?: boolean;
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
  wrapDescription = false,
  ...props
}: ClassProps & Omit<ComponentPropsWithRef<"div">, keyof ClassProps>) {
  const gradeDistribution =
    _class?.course?.gradeDistribution ?? _class?.gradeDistribution;

  return (
    <Card.RootColumn
      style={{ overflow: "visible", position: "relative", ...props?.style }}
      active={active}
      {...props}
    >
      {leftBorderColor && (
        <Card.LeftBorder
          color={leftBorderColor}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            height: "100%",
            backgroundColor: `var(--${leftBorderColor}-500)`,
          }}
        />
      )}
      <Card.ColumnHeader
        style={{
          overflow: "visible",
          marginLeft: leftBorderColor ? "8px" : undefined,
        }}
      >
        <Card.Body>
          <Card.Heading>
            {_class?.subject} {_class?.courseNumber}{" "}
            <span className={styles.sectionNumber}>
              #{formatClassNumber(_class?.number)}
            </span>
            {_class?.primarySection?.enrollment?.latest?.hasReservedSeating && (
              <Tooltip.Root disableHoverableContent>
                <Tooltip.Trigger asChild>
                  <InfoCircle className={styles.reservedSeatingIcon} />
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    asChild
                    side="bottom"
                    sideOffset={8}
                    collisionPadding={8}
                  >
                    <div className={styles.tooltipContent}>
                      <Tooltip.Arrow className={styles.tooltipArrow} />
                      <p className={styles.tooltipTitle}>Reserved Seating</p>
                      <p className={styles.tooltipDescription}>
                        This class has seating reserved for specific student
                        groups.
                      </p>
                    </div>
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            )}
          </Card.Heading>
          <Card.Description wrapDescription={wrapDescription}>
            {_class?.title ?? _class?.course?.title}
          </Card.Description>
          <Card.Footer>
            <EnrollmentDisplay
              enrolledCount={
                _class?.primarySection?.enrollment?.latest?.enrolledCount
              }
              maxEnroll={_class?.primarySection?.enrollment?.latest?.maxEnroll}
              time={_class?.primarySection?.enrollment?.latest?.endTime}
            />
            {_class?.unitsMin !== undefined &&
              _class.unitsMax !== undefined && (
                <Units unitsMin={_class.unitsMin} unitsMax={_class.unitsMax} />
              )}
            {expandable && onExpandedChange !== undefined && (
              <Card.ActionIcon
                data-action-icon
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onExpandedChange(!expanded);
                }}
                style={{ position: "absolute", right: 16 }}
              >
                {expanded ? <ArrowUnionVertical /> : <ArrowSeparateVertical />}
              </Card.ActionIcon>
            )}
          </Card.Footer>
        </Card.Body>
        <Card.Actions data-actions>
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
          {bookmarked && bookmarkToggle && (
            <Card.ActionIcon
              data-action-icon
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                bookmarkToggle();
              }}
            >
              {bookmarked ? (
                <BookmarkSolid width={16} height={16} />
              ) : (
                <Bookmark width={16} height={16} />
              )}
            </Card.ActionIcon>
          )}
          {onColorSelect && leftBorderColor && (
            <ColorSelector
              selectedColor={leftBorderColor}
              onColorSelect={onColorSelect}
            />
          )}
          {onDelete && (
            <Card.ActionIcon
              data-action-icon
              isDelete
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete();
              }}
            >
              <Trash />
            </Card.ActionIcon>
          )}
        </Card.Actions>
      </Card.ColumnHeader>
      {expanded && <Card.ColumnBody>{children}</Card.ColumnBody>}
    </Card.RootColumn>
  );
}
