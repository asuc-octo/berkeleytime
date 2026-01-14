import { useEffect, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import { Check, NavArrowDown, NavArrowRight } from "iconoir-react";

import { type Data, init } from "@repo/BtLL";

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

// eslint-disable-next-line css-modules/no-unused-class
import styles from "./BtLLRequirements.module.scss";

type JoinedCourse = ISelectedCourse & {
  course?: GetCourseRequirementsQuery["course"];
};

// Type definitions
type Course = {
  subject: Data<string>;
  number: Data<string>;
  units: Data<number>;
  breadthRequirements: Data<string[]>;
  universityRequirement: Data<string>;
};

type Column = {
  name: Data<string>;
  courses: Data<JoinedCourse[]>;
  year: Data<number>;
  semester: Data<string>;
  units: Data<number>;
};

type Plan = {
  columns: Data<Column[]>;
  allCourses: Data<Course[]>;
  units: Data<number>;
};

type RequirementResult = {
  description: Data<string>;
  result: Data<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

// Adapter functions
export function courseAdapter(
  course: ISelectedCourse & {
    course?: NonNullable<GetCourseRequirementsQuery["course"]>;
  }
): Course {
  return {
    subject: {
      data: course.courseName.split(" ")[0],
      type: "string",
    },
    number: {
      data: course.courseName.split(" ")[1],
      type: "string",
    },
    units: {
      data: course.courseUnits,
      type: "number",
    },
    universityRequirement: {
      data: course.course?.mostRecentClass?.requirementDesignation?.code ?? "",
      type: "string",
    },
    breadthRequirements: {
      data:
        course.course?.mostRecentClass?.primarySection?.sectionAttributes
          ?.filter((s) => s.attribute.code === "GE")
          .map((sectionAttribute) => sectionAttribute.value?.description)
          .filter((s) => s !== null && s !== undefined) ?? [],
      type: "List<string>",
    },
  };
}

export function columnAdapter(
  term: IPlanTerm & { courses: JoinedCourse[] }
): Column {
  return {
    year: {
      data: term.year,
      type: "number",
    },
    semester: {
      data: term.term,
      type: "string",
    },
    name: {
      data: term.name,
      type: "string",
    },
    courses: {
      data: term.courses,
      type: "List<Course>",
    },
    units: {
      data: term.courses.reduce((acc, course) => acc + course.courseUnits, 0),
      type: "number",
    },
  };
}

export function planAdapter(_plan: IPlan, columns: Column[]): Plan {
  const allCourses = columns.flatMap((column) =>
    column.courses.data.map(courseAdapter)
  );
  return {
    units: {
      data: allCourses.reduce((acc, course) => acc + course.units.data, 0),
      type: "number",
    },
    columns: {
      data: columns,
      type: "List<Column>",
    },
    allCourses: {
      data: allCourses,
      type: "List<Course>",
    },
  };
}

// Render requirement details that appear below the title
const renderRequirementDetails = (req: RequirementResult, depth: number) => {
  const indentAmount = depth * 24; // Base indent for requirement items
  // Align with requirement text (checkbox space 1.25rem = 20px + gap 0.5rem = 8px = 28px total)
  const textIndent = indentAmount + 28;

  if (req.type?.data === "NumberRequirement") {
    return (
      <p className={styles.metadata} style={{ marginLeft: `${textIndent}px` }}>
        {req.actual.data} / {req.required.data}
      </p>
    );
  }

  if (req.type?.data === "NCoursesRequirement") {
    const courses = req.courses.data ?? [];
    const requiredCount = req.required_count.data;
    return (
      <>
        <p
          className={styles.metadata}
          style={{ marginLeft: `${textIndent}px` }}
        >
          {courses.length} / {requiredCount} courses currently satisfying
        </p>
        {courses.length > 0 && (
          <div
            className={styles.courseList}
            style={{ marginLeft: `${textIndent}px` }}
          >
            {courses.map((course: Course, index: number) => (
              <div key={index} className={styles.courseItem}>
                <div className={styles.checkmarkSpace}>
                  <Check className={styles.checkmarkIcon} />
                </div>
                <p>
                  {course.subject.data} {course.number.data}
                </p>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  if (req.type?.data === "CourseListRequirement") {
    const requiredCourses = req.required_courses.data ?? [];
    const metStatuses = req.met_status.data ?? [];
    const metCount = metStatuses.filter(Boolean).length;
    return (
      <>
        <p
          className={styles.metadata}
          style={{ marginLeft: `${textIndent}px` }}
        >
          {metCount} / {requiredCourses.length} courses currently satisfying
        </p>
        {requiredCourses.length > 0 && (
          <div
            className={styles.courseList}
            style={{ marginLeft: `${textIndent}px` }}
          >
            {requiredCourses.map((course: Course, index: number) => (
              <div key={index} className={styles.courseItem}>
                <div className={styles.checkmarkSpace}>
                  {metStatuses[index] && (
                    <Check className={styles.checkmarkIcon} />
                  )}
                </div>
                <p>
                  {course.subject.data} {course.number.data}
                </p>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  if (req.type?.data === "BooleanRequirement") {
    return null; // Boolean requirements don't need extra details
  }

  if (
    req.type?.data === "AndRequirement" ||
    req.type?.data === "OrRequirement"
  ) {
    const subRequirements: RequirementResult[] = req.requirements.data ?? [];
    if (subRequirements.length === 0) return null;

    const isAnd = req.type?.data === "AndRequirement";
    const isOr = req.type?.data === "OrRequirement";
    const connector = isAnd ? "AND" : isOr ? "OR" : null;

    return (
      <div style={{ marginTop: "0.25rem" }}>
        {subRequirements.map((subReq, index) => (
          <div key={`sub-${index}`}>
            {index > 0 && connector && (
              <div
                className={styles.connector}
                style={{ marginLeft: `${textIndent}px` }}
              >
                {connector}
              </div>
            )}
            {renderRequirementItem(subReq, `sub-${index}`, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Component for a single requirement item with collapsible state
function RequirementItem({
  req,
  key: itemKey,
  depth,
}: {
  req: RequirementResult;
  key: string;
  depth: number;
}) {
  const passed = req.result.data;
  // Default: expanded if incomplete, collapsed if complete
  const [isExpanded, setIsExpanded] = useState(!passed);
  const indentAmount = depth * 24; // Increased indent for clearer hierarchy

  // Check if this requirement has details to show
  const hasDetails =
    req.type?.data === "NumberRequirement" ||
    req.type?.data === "NCoursesRequirement" ||
    req.type?.data === "CourseListRequirement" ||
    req.type?.data === "AndRequirement" ||
    req.type?.data === "OrRequirement";

  return (
    <div
      key={itemKey}
      className={`${styles.item} ${passed ? styles.fulfilled : styles.pending}`}
      style={{ marginLeft: `${indentAmount}px` }}
    >
      <div className={styles.element}>
        <div className={styles.start}>
          <div className={styles.checkmarkSpace}>
            {passed && <Check className={styles.checkmarkIcon} />}
          </div>
          <p>{req.description.data}</p>
        </div>
        {hasDetails && (
          <button
            className={styles.toggle}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <NavArrowDown className={styles.icon} />
            ) : (
              <NavArrowRight className={styles.icon} />
            )}
          </button>
        )}
      </div>
      {isExpanded && renderRequirementDetails(req, depth)}
    </div>
  );
}

// Render a single requirement item matching RequirementsAccordion structure
const renderRequirementItem = (
  req: RequirementResult,
  key: string,
  depth: number
) => {
  return <RequirementItem req={req} key={key} depth={depth} />;
};

type BtLLGradTrakInterfaceProps = {
  plan: IPlan | undefined;
  planTerms:
    | (IPlanTerm & {
        courses: JoinedCourse[];
      })[]
    | undefined;
};

export default function BtLLGradTrakInterface({
  plan,
  planTerms,
}: BtLLGradTrakInterfaceProps) {
  const apolloClient = useApolloClient();
  const [ucRequirements, setUcRequirements] = useState<
    RequirementResult[] | null
  >(null);
  const [coeRequirements, setCoeRequirements] = useState<
    RequirementResult[] | null
  >(null);
  const [eecsRequirements, setEecsRequirements] = useState<
    RequirementResult[] | null
  >(null);

  useEffect(() => {
    if (!plan || !planTerms || planTerms.length === 0) return;

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

        return {
          courseName: `${subject} ${number}`,
          courseUnits: 0,
          course: result.data?.course ?? undefined,
        } as ISelectedCourse & {
          course?: NonNullable<GetCourseRequirementsQuery["course"]>;
        };
      } catch (error) {
        console.error(`Failed to fetch course ${subject} ${number}:`, error);
        return {
          courseName: `${subject} ${number}`,
          courseUnits: 0,
          course: undefined,
        } as ISelectedCourse;
      }
    };

    const commonVars = new Map<string, Data<unknown>>([
      ["this", { data: planAdapter(plan, columns), type: "Plan" }],
      ["columns", { data: columns, type: "List<Column>" }],
    ]);

    const config = {
      debug: false,
      fetchCourse,
    };

    const uc = init(UC_REQ_BTLL, commonVars, config) as
      | RequirementResult[]
      | null;
    const coe = init(COE_REQ_BTLL, commonVars, config) as
      | RequirementResult[]
      | null;
    const eecs = init(EECS_REQ_BTLL, commonVars, config) as
      | RequirementResult[]
      | null;

    if (Array.isArray(uc)) setUcRequirements(uc);
    if (Array.isArray(coe)) setCoeRequirements(coe);
    if (Array.isArray(eecs)) setEecsRequirements(eecs);
  }, [plan, planTerms, apolloClient]);

  if (!plan || !planTerms || planTerms.length === 0) {
    return null;
  }

  const hasAnyRequirements =
    (ucRequirements && ucRequirements.length > 0) ||
    (coeRequirements && coeRequirements.length > 0) ||
    (eecsRequirements && eecsRequirements.length > 0);

  if (!hasAnyRequirements) return null;

  return (
    <>
      {ucRequirements && ucRequirements.length > 0 && (
        <BtLLRequirementsAccordion
          title="University of California"
          requirements={ucRequirements}
        />
      )}

      {coeRequirements && coeRequirements.length > 0 && (
        <BtLLRequirementsAccordion
          title="College of Engineering"
          requirements={coeRequirements}
        />
      )}

      {eecsRequirements && eecsRequirements.length > 0 && (
        <BtLLRequirementsAccordion
          title="EECS Major"
          requirements={eecsRequirements}
        />
      )}
    </>
  );
}

// Component matching RequirementsAccordion structure
function BtLLRequirementsAccordion({
  title,
  requirements,
}: {
  title: string;
  requirements: RequirementResult[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if all requirements are fulfilled
  const allFulfilled = requirements.every((req) => req.result?.data === true);

  return (
    <div className={styles.accordion}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          {allFulfilled && (
            <div className={styles.checkmarkSpace}>
              <Check className={styles.checkmarkIcon} />
            </div>
          )}
          <div className={styles.title}>{title}</div>
        </div>
        <button
          className={styles.toggle}
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <NavArrowDown className={styles.icon} />
          ) : (
            <NavArrowRight className={styles.icon} />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.body}>
          {requirements.map((req, index) =>
            renderRequirementItem(req, `req-${index}`, 0)
          )}
        </div>
      )}
    </div>
  );
}
