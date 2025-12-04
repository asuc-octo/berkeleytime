import { ComponentPropsWithRef } from "react";

import { Trash } from "iconoir-react";
import { Link } from "react-router-dom";

import { Card } from "@repo/theme";

import { useDeleteSchedule } from "@/hooks/api";
import { IScheduleListSchedule } from "@/lib/api";
import ScheduleSummary from "../ScheduleSummary";

interface ScheduleProps {
  _id: string;
  name: string;
  schedule: IScheduleListSchedule;
}

export default function ScheduleCard({
  _id,
  name,
  schedule,
  ...props
}: ScheduleProps & Omit<ComponentPropsWithRef<"div">, keyof ScheduleProps>) {
  const [deleteSchedule] = useDeleteSchedule();
  return (
    <Link to={`/schedules/${_id}`}>
      <Card.RootColumn {...props}>
        <Card.ColumnHeader>
          <Card.Body>
            <Card.Heading>{name}</Card.Heading>
            { schedule?.classes && <Card.Description>{`${schedule.classes.length} classes`}</Card.Description> }
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
        </Card.ColumnHeader>
        <Card.ColumnBody>
          <ScheduleSummary
            schedule={schedule}
          />
        </Card.ColumnBody>
      </Card.RootColumn>
    </Link>
  );
}
