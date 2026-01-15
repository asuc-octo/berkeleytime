import { useEffect, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import classNames from "classnames";
import { Check, NavArrowDown, NavArrowRight } from "iconoir-react";

import { type Data, init } from "@repo/BtLL";

import { IPlan, IPlanTerm, ISelectedCourse } from "@/lib/api";
import { IPlanRequirement } from "@/lib/api/plans";
import {
  GetCollegeRequirementsDocument,
  GetCollegeRequirementsQuery,
  GetCourseRequirementsDocument,
  GetCourseRequirementsQuery,
  GetPlanDocument,
  GetPlanRequirementsByMajorsAndMinorsDocument,
  GetPlanRequirementsByMajorsAndMinorsQuery,
  GetUcRequirementsDocument,
  GetUcRequirementsQuery,
  UpdateManualOverrideDocument,
  UpdateSelectedPlanRequirementsDocument,
} from "@/lib/generated/graphql";

// eslint-disable-next-line css-modules/no-unused-class
import styles from "./BtLLInterface.module.scss";
import { columnAdapter, planAdapter } from "./adapter";
import { Course, JoinedCourse } from "./helper";

type RequirementResult = {
  description: Data<string>;
  result: Data<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

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
            {renderRequirementItem(subReq, `sub-${index}`, depth + 1, -1)}
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Component for a single requirement item with collapsible state and manual override support
function RequirementItem({
  req,
  key: itemKey,
  depth,
  requirementIndex,
  manualOverride,
  onToggleManualOverride,
}: {
  req: RequirementResult;
  key: string;
  depth: number;
  requirementIndex: number; // -1 for nested requirements that don't support manual override
  manualOverride?: boolean | null;
  onToggleManualOverride?: () => void;
}) {
  // requirementIndex is used by parent component when calling onToggleManualOverride
  void requirementIndex;
  const isMet = req.result.data;
  const isManuallyOverridden =
    manualOverride !== null && manualOverride !== undefined && manualOverride;

  // Default: expanded if incomplete, collapsed if complete
  const [isExpanded, setIsExpanded] = useState(
    !(isMet || isManuallyOverridden)
  );
  const [isHovered, setIsHovered] = useState(false);
  const indentAmount = depth * 24; // Increased indent for clearer hierarchy

  // Check if this requirement has details to show
  const hasDetails =
    req.type?.data === "NumberRequirement" ||
    req.type?.data === "NCoursesRequirement" ||
    req.type?.data === "CourseListRequirement" ||
    req.type?.data === "AndRequirement" ||
    req.type?.data === "OrRequirement";

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(isManuallyOverridden);
    if (onToggleManualOverride) {
      onToggleManualOverride();
    }
  };

  return (
    <div
      key={itemKey}
      className={styles.item}
      style={{ marginLeft: `${indentAmount}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.element}>
        <div className={styles.start}>
          <div
            className={classNames(styles.checkmarkSpace, {
              [styles.clickable]: onToggleManualOverride,
            })}
            onClick={handleCheckClick}
            title={
              onToggleManualOverride
                ? isManuallyOverridden
                  ? "Click to remove manual override"
                  : "Click to manually mark as complete"
                : undefined
            }
          >
            <Check
              className={classNames(styles.checkmarkIcon, {
                [styles.visible]:
                  isMet ||
                  isManuallyOverridden ||
                  (isHovered && onToggleManualOverride),
                [styles.hoverCheckmark]:
                  !isMet &&
                  !isManuallyOverridden &&
                  isHovered &&
                  onToggleManualOverride,
                [styles.autoCheckmark]: isMet && !isManuallyOverridden,
              })}
            />
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
  depth: number,
  requirementIndex: number,
  manualOverride?: boolean | null,
  onToggleManualOverride?: () => void
) => {
  return (
    <RequirementItem
      req={req}
      key={key}
      depth={depth}
      requirementIndex={requirementIndex}
      manualOverride={manualOverride}
      onToggleManualOverride={onToggleManualOverride}
    />
  );
};

// Type for evaluated requirements with their source info
type EvaluatedRequirementGroup = {
  title: string;
  requirements: RequirementResult[];
  source: IPlanRequirement;
  selectedPlanRequirement?: NonNullable<
    IPlan["selectedPlanRequirements"]
  >[number];
};

type BtLLGradTrakInterfaceProps = {
  plan: IPlan | undefined;
  planTerms:
    | (IPlanTerm & {
        courses: JoinedCourse[];
      })[]
    | undefined;
  majors?: string[];
  minors?: string[];
  colleges?: string[];
};

export default function BtLLGradTrakInterface({
  plan,
  planTerms,
  majors = [],
  minors = [],
  colleges = [],
}: BtLLGradTrakInterfaceProps) {
  const apolloClient = useApolloClient();
  const [evaluatedGroups, setEvaluatedGroups] = useState<
    EvaluatedRequirementGroup[]
  >([]);
  const [supportedMajors, setSupportedMajors] = useState<Set<string>>(
    new Set()
  );
  const [supportedMinors, setSupportedMinors] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!plan || !planTerms || planTerms.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchAndEvaluateRequirements = async () => {
      setIsLoading(true);

      // Check if selectedPlanRequirements is empty
      const hasSelectedPlanRequirements =
        plan.selectedPlanRequirements &&
        plan.selectedPlanRequirements.length > 0;

      if (hasSelectedPlanRequirements) {
        // Use existing selectedPlanRequirements
        const groups: EvaluatedRequirementGroup[] = [];
        const foundMajors = new Set<string>();
        const foundMinors = new Set<string>();

        for (const spr of plan.selectedPlanRequirements) {
          if (!spr.planRequirement) continue;

          const req = spr.planRequirement;
          let title: string;
          if (req.isUcReq) {
            title = "University of California";
          } else if (req.college) {
            title = `${req.college} Requirements`;
          } else if (req.major) {
            title = `${req.major} Major`;
            foundMajors.add(req.major);
          } else if (req.minor) {
            title = `${req.minor} Minor`;
            foundMinors.add(req.minor);
          } else {
            title = "Requirements";
          }

          // Re-evaluate the requirements to get the RequirementResult structure
          const columns = planTerms
            .filter((pt) => pt.year !== -1)
            .map(columnAdapter);

          const fetchCourse = async (subject: string, number: string) => {
            try {
              const result = await apolloClient.query({
                query: GetCourseRequirementsDocument,
                variables: { subject, number },
              });
              return {
                courseName: `${subject} ${number}`,
                courseUnits: 0,
                course: result.data?.course ?? undefined,
              } as ISelectedCourse & {
                course?: NonNullable<GetCourseRequirementsQuery["course"]>;
              };
            } catch (error) {
              console.error(
                `Failed to fetch course ${subject} ${number}:`,
                error
              );
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

          const config = { debug: false, fetchCourse };
          const evaluated = init(req.code, commonVars, config) as
            | RequirementResult[]
            | null;

          if (Array.isArray(evaluated) && evaluated.length > 0) {
            // Check if manualOverrides length matches evaluated requirements length
            const currentOverrides = spr.manualOverrides ?? [];
            if (currentOverrides.length !== evaluated.length) {
              // Reset manualOverrides to match new requirements length
              const newOverrides: (boolean | null)[] = new Array(
                evaluated.length
              ).fill(false);
              try {
                await apolloClient.mutate({
                  mutation: UpdateSelectedPlanRequirementsDocument,
                  variables: {
                    selectedPlanRequirements: [
                      {
                        planRequirementId: req._id,
                        manualOverrides: newOverrides,
                      },
                    ],
                  },
                  refetchQueries: [{ query: GetPlanDocument }],
                });
                // Update local spr reference with new overrides
                spr.manualOverrides = newOverrides;
              } catch (error) {
                console.error(
                  "Failed to reset manualOverrides for mismatched length:",
                  error
                );
              }
            }

            groups.push({
              title,
              requirements: evaluated,
              source: req,
              selectedPlanRequirement: spr,
            });
          }
        }

        setEvaluatedGroups(groups);
        setSupportedMajors(foundMajors);
        setSupportedMinors(foundMinors);
        setIsLoading(false);
        return;
      }

      // If selectedPlanRequirements is empty, evaluate and save
      const columns = planTerms
        .filter((pt) => pt.year !== -1)
        .map(columnAdapter);

      const fetchCourse = async (subject: string, number: string) => {
        try {
          const result = await apolloClient.query({
            query: GetCourseRequirementsDocument,
            variables: { subject, number },
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

      const config = { debug: false, fetchCourse };
      const groups: EvaluatedRequirementGroup[] = [];
      const foundMajors = new Set<string>();
      const foundMinors = new Set<string>();
      const selectedPlanRequirementsToSave: Array<{
        planRequirementId: string;
        manualOverrides: (boolean | null)[];
      }> = [];

      try {
        // Fetch UC requirements
        const ucResult = await apolloClient.query({
          query: GetUcRequirementsDocument,
        });
        const ucReqs: IPlanRequirement[] =
          (ucResult.data as GetUcRequirementsQuery)?.ucRequirements ?? [];
        for (const req of ucReqs) {
          const evaluated = init(req.code, commonVars, config) as
            | RequirementResult[]
            | null;
          if (Array.isArray(evaluated) && evaluated.length > 0) {
            groups.push({
              title: "University of California",
              requirements: evaluated,
              source: req,
            });
            selectedPlanRequirementsToSave.push({
              planRequirementId: req._id,
              manualOverrides: new Array(evaluated.length).fill(false),
            });
          }
        }

        // Fetch college requirements for each college
        for (const college of colleges) {
          const collegeResult = await apolloClient.query({
            query: GetCollegeRequirementsDocument,
            variables: { college },
          });
          const collegeReqs: IPlanRequirement[] =
            (collegeResult.data as GetCollegeRequirementsQuery)
              ?.collegeRequirements ?? [];
          for (const req of collegeReqs) {
            const evaluated = init(req.code, commonVars, config) as
              | RequirementResult[]
              | null;
            if (Array.isArray(evaluated) && evaluated.length > 0) {
              groups.push({
                title: `${college} Requirements`,
                requirements: evaluated,
                source: req,
              });
              selectedPlanRequirementsToSave.push({
                planRequirementId: req._id,
                manualOverrides: new Array(evaluated.length).fill(false),
              });
            }
          }
        }

        // Fetch major/minor requirements
        const majorMinorResult = await apolloClient.query({
          query: GetPlanRequirementsByMajorsAndMinorsDocument,
          variables: { majors, minors },
        });
        const majorMinorReqs: IPlanRequirement[] =
          (majorMinorResult.data as GetPlanRequirementsByMajorsAndMinorsQuery)
            ?.planRequirementsByMajorsAndMinors ?? [];
        for (const req of majorMinorReqs) {
          const evaluated = init(req.code, commonVars, config) as
            | RequirementResult[]
            | null;
          if (Array.isArray(evaluated) && evaluated.length > 0) {
            const title = req.major
              ? `${req.major} Major`
              : req.minor
                ? `${req.minor} Minor`
                : "Requirements";
            groups.push({
              title,
              requirements: evaluated,
              source: req,
            });
            selectedPlanRequirementsToSave.push({
              planRequirementId: req._id,
              manualOverrides: new Array(evaluated.length).fill(false),
            });
            if (req.major) foundMajors.add(req.major);
            if (req.minor) foundMinors.add(req.minor);
          }
        }

        // Save selectedPlanRequirements
        if (selectedPlanRequirementsToSave.length > 0) {
          try {
            await apolloClient.mutate({
              mutation: UpdateSelectedPlanRequirementsDocument,
              variables: {
                selectedPlanRequirements: selectedPlanRequirementsToSave,
              },
            });
          } catch (error) {
            console.error("Failed to save selectedPlanRequirements:", error);
          }
        }
      } catch (error) {
        console.error("Failed to fetch requirements:", error);
      }

      setEvaluatedGroups(groups);
      setSupportedMajors(foundMajors);
      setSupportedMinors(foundMinors);
      setIsLoading(false);
    };

    fetchAndEvaluateRequirements();
  }, [plan, planTerms, apolloClient, majors, minors, colleges]);

  if (!plan || !planTerms || planTerms.length === 0) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  // Check which majors/minors don't have requirements in the database
  const unsupportedMajors = majors.filter(
    (major) =>
      !Array.from(supportedMajors).some(
        (s) => major.includes(s) || s.includes(major)
      )
  );
  const unsupportedMinors = minors.filter(
    (minor) =>
      !Array.from(supportedMinors).some(
        (s) => minor.includes(s) || s.includes(minor)
      )
  );

  return (
    <>
      {evaluatedGroups.map((group, index) => (
        <BtLLRequirementsAccordion
          key={`group-${index}`}
          title={group.title}
          requirements={group.requirements}
          selectedPlanRequirement={group.selectedPlanRequirement}
          apolloClient={apolloClient}
        />
      ))}

      {/* Show "Coming Soon" for majors without requirements in DB */}
      {unsupportedMajors.map((major, index) => (
        <ComingSoonAccordion
          key={`major-${index}`}
          title={major}
          type="major"
        />
      ))}

      {/* Show "Coming Soon" for minors without requirements in DB */}
      {unsupportedMinors.map((minor, index) => (
        <ComingSoonAccordion
          key={`minor-${index}`}
          title={minor}
          type="minor"
        />
      ))}
    </>
  );
}

// Component for showing "Coming Soon" placeholder for majors/minors without requirements
function ComingSoonAccordion({
  title,
  type,
}: {
  title: string;
  type: "major" | "minor";
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.accordion}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <div className={styles.title}>
            {title} {type === "major" ? "Major" : "Minor"}
          </div>
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
          <div className={styles.comingSoon}>
            <p className={styles.comingSoonText}>
              Requirements for this {type} are coming soon.
            </p>
            <p className={styles.comingSoonSubtext}>
              In the meantime, please refer to the official degree requirements
              from the department website.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Renders each BtLL Requirement in an accordion
function BtLLRequirementsAccordion({
  title,
  requirements,
  selectedPlanRequirement,
  apolloClient,
}: {
  title: string;
  requirements: RequirementResult[];
  selectedPlanRequirement?: NonNullable<
    IPlan["selectedPlanRequirements"]
  >[number];
  apolloClient: ReturnType<typeof useApolloClient>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if all requirements are fulfilled (considering manual overrides)
  const allFulfilled = requirements.every((req, index) => {
    const manualOverride = selectedPlanRequirement?.manualOverrides?.[index];
    const evaluatedResult = req.result?.data ?? false;
    return manualOverride !== null && manualOverride !== undefined
      ? manualOverride
      : evaluatedResult;
  });

  const handleToggleManualOverride = async (requirementIndex: number) => {
    if (!selectedPlanRequirement?.planRequirement?._id) return;

    const currentOverride =
      selectedPlanRequirement.manualOverrides?.[requirementIndex];
    const evaluatedResult =
      requirements[requirementIndex]?.result?.data ?? false;

    // Toggle logic: if manually overridden, clear it; otherwise set opposite of evaluated
    const newOverride =
      currentOverride !== null && currentOverride !== undefined
        ? null // Clear manual override
        : !evaluatedResult; // Set to opposite of evaluated result

    try {
      await apolloClient.mutate({
        mutation: UpdateManualOverrideDocument,
        variables: {
          input: {
            planRequirementId: selectedPlanRequirement.planRequirement._id,
            requirementIndex,
            manualOverride: newOverride ?? undefined,
          },
        },
        refetchQueries: [{ query: GetPlanDocument }],
      });
    } catch (error) {
      console.error("Failed to update manual override:", error);
    }
  };

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
          {requirements.map((req, index) => {
            const manualOverride =
              selectedPlanRequirement?.manualOverrides?.[index];
            return renderRequirementItem(
              req,
              `req-${index}`,
              0,
              index,
              manualOverride,
              () => handleToggleManualOverride(index)
            );
          })}
        </div>
      )}
    </div>
  );
}
