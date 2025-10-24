import { ComponentPropsWithRef } from "react";

import {
  ArrowSeparateVertical,
  ArrowUnionVertical,
  Bookmark,
  BookmarkSolid,
  Trash,
} from "iconoir-react";

import { Card } from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import EnrollmentDisplay from "@/components/EnrollmentDisplay";
import Units from "@/components/Units";
import { IClass } from "@/lib/api";

interface ClassProps {
  class: IClass;
  expandable?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onDelete?: () => void;
  leftBorderColor?: string;
  bookmarked?: boolean;
  bookmarkToggle?: () => {};
}

export default function ClassCard({
  class: {
    course: {
      title: courseTitle,
      subject: courseSubject,
      number: courseNumber2,
      gradeDistribution,
    },
    title,
    subject,
    courseNumber,
    number,
    primarySection: { enrollment },
    unitsMax,
    unitsMin,
  },
  expandable = false,
  expanded,
  onExpandedChange,
  onDelete,
  leftBorderColor = undefined,
  bookmarked = false,
  children,
  bookmarkToggle,
  ...props
}: ClassProps & Omit<ComponentPropsWithRef<"div">, keyof ClassProps>) {
  return (
    <Card.RootColumn {...props}>
      <Card.ColumnHeader>
        {leftBorderColor && <Card.LeftBorder color={leftBorderColor} />}
        <Card.Body>
          <Card.Heading>
            {subject ?? courseSubject} {courseNumber ?? courseNumber2} #{number}
          </Card.Heading>
          <Card.Description>{title ?? courseTitle}</Card.Description>
          <Card.Footer>
            <EnrollmentDisplay
              enrolledCount={enrollment?.latest?.enrolledCount}
              maxEnroll={enrollment?.latest?.maxEnroll}
            />
            <Units unitsMin={unitsMin} unitsMax={unitsMax} />
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
              style={{ marginTop: 0.5, fontSize: 15 }}
            />
          )}
          {bookmarked && bookmarkToggle && (
            <Card.ActionIcon onClick={bookmarkToggle}>
              {bookmarked ? (
                <BookmarkSolid width={16} height={16} />
              ) : (
                <Bookmark width={16} height={16} />
              )}
            </Card.ActionIcon>
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
