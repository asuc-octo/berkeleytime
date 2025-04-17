import { ComponentPropsWithRef } from "react";

import { ArrowRight } from "iconoir-react";

import { Card } from "@repo/theme";

import { AverageGrade } from "@/components/AverageGrade";
import Capacity from "@/components/Capacity";
import Units from "@/components/Units";
import { IClass } from "@/lib/api";

interface ClassProps {
  class: IClass;
}

export default function ClassCard({
  class: data,
  ...props
}: ClassProps & Omit<ComponentPropsWithRef<"div">, keyof ClassProps>) {
  return (
    <Card.Root {...props}>
      <Card.Body>
        <Card.Heading>
          {data.subject} {data.courseNumber} #{data.number}
        </Card.Heading>
        <Card.Description>{data.title ?? data.course.title}</Card.Description>
        <Card.Footer>
          <AverageGrade gradeDistribution={data.gradeDistribution} />
          <Capacity
            enrolledCount={data.primarySection.enrollment?.latest.enrolledCount}
            maxEnroll={data.primarySection.enrollment?.latest.maxEnroll}
            waitlistedCount={
              data.primarySection.enrollment?.latest.waitlistedCount
            }
            maxWaitlist={data.primarySection.enrollment?.latest.maxWaitlist}
          />
          <Units unitsMin={data.unitsMin} unitsMax={data.unitsMax} />
        </Card.Footer>
      </Card.Body>
      <Card.Actions>
        <Card.ActionIcon>
          <ArrowRight />
        </Card.ActionIcon>
      </Card.Actions>
    </Card.Root>
  );
}
