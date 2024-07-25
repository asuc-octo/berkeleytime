import { ReactNode, forwardRef } from "react";

import { useQuery } from "@apollo/client";
import {
  Content,
  DialogTriggerProps,
  Overlay,
  Portal,
  Root,
  Trigger,
} from "@radix-ui/react-dialog";

import Course from "@/components/Course";
import { GET_COURSE, GetCourseResponse, ICourse } from "@/lib/api";

import styles from "./CourseDrawer.module.scss";

interface Props {
  subject: string;
  number: string;
  partialCourse?: ICourse | null;
}

function Body({ subject, number }: Props) {
  const { data, loading } = useQuery<GetCourseResponse>(GET_COURSE, {
    variables: {
      subject,
      courseNumber: number,
    },
  });

  return data ? (
    <Course
      subject={subject}
      number={number}
      partialCourse={data.course}
      dialog
    />
  ) : loading ? (
    <></>
  ) : (
    <></>
  );
}

interface BaseCourseDrawerProps extends Props {
  onOpenChange?: (open: boolean) => void;
}

export interface ControlledCourseDrawerProps extends BaseCourseDrawerProps {
  open: boolean;
  children?: never;
}

export interface DefaultCourseDrawerProps extends BaseCourseDrawerProps {
  open?: boolean;
  children: ReactNode;
}

export type CourseDrawerProps =
  | ControlledCourseDrawerProps
  | DefaultCourseDrawerProps;

// TODO: Determine if this component would be better suited in the global context
const CourseDrawer = forwardRef<
  HTMLButtonElement,
  CourseDrawerProps & Omit<DialogTriggerProps, "asChild">
>(
  (
    { subject, children, number, partialCourse, open, onOpenChange, ...props },
    ref
  ) => {
    return (
      <Root onOpenChange={onOpenChange} open={open}>
        {children && (
          <Trigger {...props} asChild ref={ref}>
            {children}
          </Trigger>
        )}
        <Portal>
          <Overlay className={styles.overlay} />
          <Content
            className={styles.content}
            // TODO: Automatically focus a relevant element
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <Body
              subject={subject}
              number={number}
              partialCourse={partialCourse}
            />
          </Content>
        </Portal>
      </Root>
    );
  }
);

export default CourseDrawer;
