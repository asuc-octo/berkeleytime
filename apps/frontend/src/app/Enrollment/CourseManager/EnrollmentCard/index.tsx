import { useRef } from "react";

import { Eye, EyeClosed, Trash } from "iconoir-react";

import { Card } from "@repo/theme";
import { ColoredSquare } from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import { useReadCourse } from "@/hooks/api";

interface EnrollmentCardProps {
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

export default function EnrollmentCard({
  color,
  subject,
  number,
  description,
  onClick,
  onClickDelete,
  onClickHide,
  active,
  hidden,
}: EnrollmentCardProps) {
  const hideRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);

  const { data: data } = useReadCourse(subject, number);

  return (
    <Card.Root
      active={active}
      disabled={hidden}
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
        <Card.Heading
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <ColoredSquare
            color={color}
            size="md"
            style={{ width: 16, height: 16 }}
          />
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
        {data?.gradeDistribution && (
          <AverageGrade gradeDistribution={data.gradeDistribution} />
        )}
        <Card.ActionIcon
          onClick={onClickHide}
          ref={hideRef}
          style={{ color: "var(--label-color)" }}
        >
          {!hidden ? <Eye /> : <EyeClosed />}
        </Card.ActionIcon>
        <Card.ActionIcon
          onClick={onClickDelete}
          ref={deleteRef}
          style={{ color: "var(--label-color)" }}
        >
          <Trash />
        </Card.ActionIcon>
      </Card.Actions>
    </Card.Root>
  );
}
