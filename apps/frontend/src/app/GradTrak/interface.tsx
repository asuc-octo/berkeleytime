import { useEffect } from "react";

import { useApolloClient } from "@apollo/client/react";

import { columnAdapter, init, planAdapter } from "@repo/BtLL";

import {
  COE_REQ_BTLL,
  EECS_REQ_BTLL,
  UC_REQ_BTLL,
} from "@/app/GradTrak/Dashboard/testBtLL";
import { IPlan, IPlanTerm, ISelectedCourse } from "@/lib/api";
import {
  GetCourseRequirementsDocument,
  GetCourseRequirementsQuery,
} from "@/lib/generated/graphql";

type JoinedCourse = ISelectedCourse & {
  course?: GetCourseRequirementsQuery["course"];
};

export default function BtLLGradTrakInterface(
  plan: IPlan | undefined,
  planTerms: (IPlanTerm & { courses: JoinedCourse[] })[] | undefined
) {
  const apolloClient = useApolloClient();

  useEffect(() => {
    if (!plan || !planTerms || planTerms.length === 0) return;
    console.log(planTerms);
    const columns = planTerms.filter((pt) => pt.year !== -1).map(columnAdapter);

    const fetchCourse = async (subject: string, number: string) => {
      try {
        const result = await apolloClient.query({
          query: GetCourseRequirementsDocument,
          variables: {
            subject,
            number,
          },
        });

        // Return data in the format expected by courseAdapter
        return {
          courseName: `${subject} ${number}`,
          courseUnits: 0, // Will be populated if available
          course: result.data?.course ?? undefined,
        } as ISelectedCourse & {
          course?: NonNullable<GetCourseRequirementsQuery["course"]>;
        };
      } catch (error) {
        console.error(`Failed to fetch course ${subject} ${number}:`, error);
        // Return minimal course data
        return {
          courseName: `${subject} ${number}`,
          courseUnits: 0,
          course: undefined,
        } as ISelectedCourse;
      }
    };

    const result_uc = init(
      UC_REQ_BTLL,
      new Map([
        ["this", { data: planAdapter(plan, columns), type: "Plan" }],
        ["columns", { data: columns, type: "List<Column>" }],
      ]),
      {
        debug: false,
        fetchCourse,
      }
    );
    const result_coe = init(
      COE_REQ_BTLL,
      new Map([
        ["this", { data: planAdapter(plan, columns), type: "Plan" }],
        ["columns", { data: columns, type: "List<Column>" }],
      ]),
      {
        debug: false,
        fetchCourse,
      }
    );
    const result_eecs = init(
      EECS_REQ_BTLL,
      new Map([
        ["this", { data: planAdapter(plan, columns), type: "Plan" }],
        ["columns", { data: columns, type: "List<Column>" }],
      ]),
      {
        debug: false,
        fetchCourse,
      }
    );
    console.log(result_uc, result_coe, result_eecs);
  }, [plan, planTerms, apolloClient]);
}
