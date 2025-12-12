import { ComponentPropsWithRef, ReactNode } from "react";

import {
  ArrowSeparateVertical,
  ArrowUnionVertical,
  InfoCircle,
  Star,
  Trash,
} from "iconoir-react";

import { Card, Tooltip } from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import EnrollmentDisplay from "@/components/EnrollmentDisplay";
import Units from "@/components/Units";
import { IClass, IClassCourse } from "@/lib/api";
import { IEnrollmentSingular } from "@/lib/api/enrollment";
import { Color, Semester } from "@/lib/generated/graphql";

import ColorSelector from "../ColorSelector";
import styles from "./ClassCard.module.scss";

const formatSemester = (semester: Semester): string => {
  switch (semester) {
    case Semester.Fall:
      return "Fall";
    case Semester.Spring:
      return "Spring";
    case Semester.Summer:
      return "Summer";
    default:
      return semester;
  }
};

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

type CourseSummary = Pick<IClassCourse, "title" | "gradeDistribution"> & {
  ratingsCount?: number | null;
};

type EnrollmentSnapshot = Pick<
  IEnrollmentSingular,
  "enrolledCount" | "maxEnroll" | "endTime" | "activeReservedMaxCount"
>;

type ClassCardClass = Partial<BaseClassFields> & {
  year?: number;
  semester?: Semester;
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
  acceptedColors?: Color[];
  bookmarked?: boolean;
  bookmarkToggle?: () => void;
  active?: boolean;
  wrapDescription?: boolean;
  customActionMenu?: ReactNode;
}

export default function ClassCard({
  class: _class,
  expandable = false,
  expanded,
  onExpandedChange,
  onDelete,
  leftBorderColor = undefined,
  onColorSelect = undefined,
  acceptedColors = Object.values(Color),
  bookmarked = false,
  children,
  active = false,
  wrapDescription = false,
  customActionMenu,
  ...props
}: ClassProps & Omit<ComponentPropsWithRef<"div">, keyof ClassProps>) {
  const gradeDistribution =
    _class?.course?.gradeDistribution ?? _class?.gradeDistribution;

  const activeReservedMaxCount =
    _class?.primarySection?.enrollment?.latest?.activeReservedMaxCount ?? 0;
  const maxEnroll = _class?.primarySection?.enrollment?.latest?.maxEnroll ?? 0;

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
          </Card.Heading>
          <Card.Description wrapDescription={wrapDescription}>
            {_class?.title ?? _class?.course?.title}
          </Card.Description>
          {_class?.semester && _class?.year && (
            <span className={styles.semester}>
              {formatSemester(_class.semester)} {_class.year}
            </span>
          )}
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
            {(_class?.primarySection?.enrollment?.latest
              ?.activeReservedMaxCount ?? 0) > 0 && (
              <Tooltip
                trigger={
                  <span className={styles.reservedSeating}>
                    <InfoCircle className={styles.reservedSeatingIcon} />
                    Reserved
                  </span>
                }
                title="Reserved Seating"
                description={`${activeReservedMaxCount.toLocaleString()} out of ${maxEnroll.toLocaleString()} seats for this class are reserved.`}
              />
            )}
            {(_class?.course?.ratingsCount ?? 0) > 0 && (
              <span className={styles.ratingsCount}>
                <Star className={styles.ratingsIcon} />
                {_class?.course?.ratingsCount}
              </span>
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
          {customActionMenu ? (
            customActionMenu
          ) : (
            <>
              {onColorSelect && leftBorderColor && (
                <ColorSelector
                  selectedColor={leftBorderColor}
                  allowedColors={acceptedColors}
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
            </>
          )}
        </Card.Actions>
      </Card.ColumnHeader>
      {expanded && <Card.ColumnBody>{children}</Card.ColumnBody>}
    </Card.RootColumn>
  );
}
