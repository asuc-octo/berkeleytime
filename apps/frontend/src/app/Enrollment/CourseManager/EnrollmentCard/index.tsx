import { useRef } from "react";

import { Eye, EyeClosed, Trash } from "iconoir-react";

import { Card, ColorSquare } from "@repo/theme";

import { useReadCourseTitle } from "@/hooks/api";

interface GradesCardProps {
  color: string;
  subject: string;
  number: string;
  description: string;
  onClick: () => void;
  onClickDelete: () => void;
  onClickHide: () => void;
  active: boolean;
  hidden: boolean;
}

export default function GradesCard({
  color,
  subject,
  number,
  description,
  onClick,
  onClickDelete,
  onClickHide,
  active,
  hidden,
}: GradesCardProps) {
  const hideRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);

  const { data: data } = useReadCourseTitle(subject, number);

  return (
    <Card.Root
      active={active}
      hidden={hidden}
      onClick={(event) => {
        if (
          hideRef.current &&
          !hideRef.current.contains(event.target as Node) &&
          deleteRef.current &&
          !deleteRef.current.contains(event.target as Node)
        ) {
          onClick();
        }
      }}
    >
      <Card.Body style={{ maxWidth: "calc(100% - 44px)" }}>
        <Card.Heading>
          <ColorSquare color={color} size={12} />
          {subject} {number}
        </Card.Heading>
        <Card.Description
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            textWrap: "nowrap",
          }}
        >
          {data?.title ?? "N/A"}
        </Card.Description>
        <Card.Footer style={{ marginTop: "2px" }}>{description}</Card.Footer>
      </Card.Body>
      <Card.Actions>
        <Card.ActionIcon onClick={onClickHide} ref={hideRef}>
          {!hidden ? <Eye /> : <EyeClosed />}
        </Card.ActionIcon>
        <Card.ActionIcon onClick={onClickDelete} ref={deleteRef}>
          <Trash />
        </Card.ActionIcon>
      </Card.Actions>
    </Card.Root>
  );
}
