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

import Class from "@/components/Class";
import { GET_CLASS, GetClassResponse, IClass, Semester } from "@/lib/api";

import styles from "./ClassDrawer.module.scss";

interface Props {
  subject: string;
  courseNumber: string;
  classNumber: string;
  semester: Semester;
  year: number;
  partialClass?: IClass | null;
}

function Body({
  subject,
  courseNumber,
  classNumber,
  semester,
  year,
  partialClass,
}: Props) {
  const { data, loading } = useQuery<GetClassResponse>(GET_CLASS, {
    variables: {
      subject,
      courseNumber,
      classNumber,
      term: {
        semester,
        year,
      },
    },
  });

  return data ? (
    <Class
      subject={subject}
      courseNumber={courseNumber}
      classNumber={classNumber}
      semester={semester}
      year={year}
      partialClass={partialClass}
      dialog
    />
  ) : loading ? (
    <></>
  ) : (
    <></>
  );
}

interface BaseClassDrawerProps extends Props {
  onOpenChange?: (open: boolean) => void;
}

export interface DefaultClassDrawerProps extends BaseClassDrawerProps {
  open?: boolean;
  children: ReactNode;
}

export interface ControlledClassDrawerProps extends BaseClassDrawerProps {
  open: boolean;
  children?: never;
}

export type ClassDrawerProps =
  | ControlledClassDrawerProps
  | DefaultClassDrawerProps;

// TODO: Determine if this component would be better suited in the global context
const ClassDrawer = forwardRef<
  HTMLButtonElement,
  ClassDrawerProps & Omit<DialogTriggerProps, "asChild">
>(
  (
    {
      subject,
      children,
      courseNumber,
      classNumber,
      semester,
      year,
      partialClass,
      open,
      onOpenChange,
      ...props
    },
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
              courseNumber={courseNumber}
              classNumber={classNumber}
              semester={semester}
              year={year}
              partialClass={partialClass}
            />
          </Content>
        </Portal>
      </Root>
    );
  }
);

export default ClassDrawer;
