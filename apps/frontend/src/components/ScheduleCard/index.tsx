import { ComponentPropsWithRef } from "react";

import { Trash } from "iconoir-react";
import { Link } from "react-router-dom";

import { Card } from "@repo/theme";

import { useDeleteSchedule } from "@/hooks/api";
import { IScheduleListClass } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

interface ScheduleProps {
  _id: string;
  name: String;
  classes: IScheduleListClass[];
  semester?: Semester;
}

export default function ScheduleCard({
  _id,
  name,
  classes,
  semester,
  ...props
}: ScheduleProps & Omit<ComponentPropsWithRef<"div">, keyof ScheduleProps>) {
  const [deleteSchedule] = useDeleteSchedule();
  return (
    <Link to={`/schedules/${_id}`}>
      <Card.Root {...props}>
        <Card.Body>
          <Card.Heading>{name}</Card.Heading>
          {semester && <Card.Description>{semester}</Card.Description>}
          <Card.Footer>
            {classes.length > 0
              ? classes
                  .reduce((acc, c) => {
                    return (acc = `${acc} • ${c.class.subject} ${c.class.courseNumber}`);
                  }, "")
                  .substring(3)
              : "Empty schedule"}
          </Card.Footer>
        </Card.Body>
        <Card.Actions>
          <Card.ActionIcon
            onClick={(e) => {
              e.stopPropagation();
              deleteSchedule(_id);
            }}
            isDelete
          >
            <Trash />
          </Card.ActionIcon>
        </Card.Actions>
      </Card.Root>
    </Link>
  );
}
