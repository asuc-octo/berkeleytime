import { ArrowRight } from "iconoir-react";

import { ICourse } from "@/lib/api";

import { AverageGrade } from "../AverageGrade";
import { Card } from "@repo/theme";

interface CourseCardProps {
  course: ICourse;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card.Root>
      <Card.Body>
        <Card.Heading>
          {course.subject} {course.number}
        </Card.Heading>
        <Card.Description>{course.title}</Card.Description>
        <Card.Footer>
          <AverageGrade gradeDistribution={course.gradeDistribution} />
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
