import { Dispatch, SetStateAction, useEffect } from "react";

import { columnAdapter, init, planAdapter } from "@repo/BtLL";

import { UC_REQ_BTLL } from "@/app/GradTrak/Dashboard/testBtLL";
import { IPlan, IPlanTerm, ISelectedCourse } from "@/lib/api";
import { GetCourseRequirementsQuery } from "@/lib/generated/graphql";

type JoinedCourse = ISelectedCourse & {
  course?: GetCourseRequirementsQuery["course"];
};

export default function BtLLGradTrakInterface(
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
