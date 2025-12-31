import { Dispatch, SetStateAction, useEffect } from "react";

import { UC_REQ_BTLL } from "@/app/GradTrak/Dashboard/testBtLL";

import { IPlan, IPlanTerm, ISelectedCourse } from "../api";
import { GetCourseRequirementsQuery } from "../generated/graphql";
import { init } from "./interpreter";
import { columnAdapter } from "./lib/column";
import { planAdapter } from "./lib/plan";

type JoinedCourse = ISelectedCourse & {
  course?: GetCourseRequirementsQuery["course"];
};

export default function LogicEngineInterface(
  plan: IPlan | undefined,
  planTerms: (IPlanTerm & { courses: JoinedCourse[] })[] | undefined
) {
  useEffect(() => {
    if (!plan || !planTerms || planTerms.length === 0) return;
    console.log(planTerms);
    const columns = planTerms.map(columnAdapter);
    const result = init(
      UC_REQ_BTLL,
      new Map([
        ["this", { data: planAdapter(plan, columns), type: "Plan" }],
        ["columns", { data: columns, type: "List<Column>" }],
      ]),
      false
    );
    console.log(result);
  }, [plan, planTerms]);
}
