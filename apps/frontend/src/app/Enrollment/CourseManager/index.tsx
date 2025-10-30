import { Dispatch, SetStateAction } from "react";

import { useSearchParams } from "react-router-dom";

import { Flex, Grid } from "@repo/theme";

import { LIGHT_COLORS, Output, getInputSearchParam } from "../types";
import CourseInput from "./CourseInput";
import styles from "./CourseManage.module.scss";
import EnrollmentCard from "./EnrollmentCard";

interface CourseManagerProps {
  outputs: Output[];
  setOutputs: Dispatch<SetStateAction<Output[]>>;
}

export default function CourseManager({
  outputs,
  setOutputs,
}: CourseManagerProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const remove = (index: number) => {
    const currentOutputs = [...outputs];
    currentOutputs.splice(index, 1);
    setOutputs(currentOutputs);

    searchParams.delete("input");

    for (const output of currentOutputs) {
      searchParams.append("input", getInputSearchParam(output.input));
    }

    setSearchParams(searchParams);
  };

  const updateActive = (index: number, active: boolean) => {
    setOutputs((outputs) =>
      [...outputs].map((output, i) =>
        i === index
          ? { ...output, active }
          : active
            ? { ...output, active: false }
            : output
      )
    );
  };

  const updateHidden = (index: number, hidden: boolean) => {
    setOutputs((outputs) =>
      [...outputs].map((output, i) =>
        i === index ? { ...output, hidden } : output
      )
    );
  };

  return (
    <Flex direction="column" gap="4">
      <CourseInput outputs={outputs} setOutputs={setOutputs} />
      <Grid columns="4" gap="4">
        {outputs.map(({ input, ...rest }, index) => {
          const instructor = input.sectionNumber
            ? `LEC ${input.sectionNumber}`
            : "All Instructors";
          const semester = `${input.semester} ${input.year}`;
          return (
            <EnrollmentCard
              key={`${index}-${input.subject}-${input.courseNumber}-${semester} • ${instructor}`}
              subject={input.subject}
              number={input.courseNumber}
              description={`${semester} • ${instructor}`}
              onClick={() => updateActive(index, !rest.active)}
              onClickDelete={() => remove(index)}
              onClickHide={() => updateHidden(index, !rest.hidden)}
              {...rest}
              color={LIGHT_COLORS[index]}
            />
          );
        })}
        {!outputs || (!outputs.length && <div className={styles.blank}></div>)}
      </Grid>
    </Flex>
  );
}
