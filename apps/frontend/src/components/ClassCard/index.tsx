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
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { IClass } from "@/lib/api";

import ColorSelector from "../ColorSelector";

interface ClassProps {
  class?: IClass;
  expandable?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onDelete?: () => void;
  leftBorderColor?: Color;
  onColorSelect?: (c: Color) => void;
  bookmarked?: boolean;
  bookmarkToggle?: () => {};
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
  ...props
}: ClassProps & Omit<ComponentPropsWithRef<"div">, keyof ClassProps>) {
  return (
    <Card.RootColumn
      style={{ overflow: "visible", ...props?.style }}
      {...props}
    >
      <Card.ColumnHeader style={{ overflow: "visible" }}>
        {leftBorderColor && <Card.LeftBorder color={leftBorderColor} />}
        <Card.Body>
          <Card.Heading>
            {_class?.subject ?? _class?.course?.subject}{" "}
            {_class?.courseNumber ?? _class?.course?.number} #{_class?.number}
          </Card.Heading>
          <Card.Description>
            {_class?.title ?? _class?.course?.title}
          </Card.Description>
          <Card.Footer>
            <Capacity
              enrolledCount={
                _class?.primarySection?.enrollment?.latest.enrolledCount
              }
              maxEnroll={_class?.primarySection?.enrollment?.latest.maxEnroll}
              waitlistedCount={
                _class?.primarySection?.enrollment?.latest.waitlistedCount
              }
              maxWaitlist={
                _class?.primarySection?.enrollment?.latest.maxWaitlist
              }
            />
            {_class?.unitsMin && _class.unitsMax && (
              <Units unitsMin={_class?.unitsMin} unitsMax={_class?.unitsMax} />
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
          {_class?.gradeDistribution && (
            <AverageGrade
              gradeDistribution={_class.gradeDistribution}
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
          {onColorSelect && leftBorderColor && (
            <ColorSelector
              selectedColor={leftBorderColor}
              onColorSelect={onColorSelect}
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
