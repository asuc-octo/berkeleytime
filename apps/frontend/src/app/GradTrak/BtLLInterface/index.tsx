import { useEffect, useState } from "react";

import { useApolloClient } from "@apollo/client/react";
import classNames from "classnames";
import { Check, NavArrowDown, NavArrowRight } from "iconoir-react";

import { type Data, init } from "@repo/BtLL";

import { IPlan, IPlanTerm, ISelectedCourse } from "@/lib/api";
import { IPlanRequirement } from "@/lib/api/plans";
import {
  GetCourseRequirementsDocument,
  GetCourseRequirementsQuery,
  UpdateManualOverrideDocument,
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

// Evaluate effective met status taking into account nested child overrides
export function evaluateEffectiveMet(
  req: RequirementResult,
  overrides?: (boolean | null)[]
): { isMet: boolean; isManuallyMet: boolean; isManuallyNotMet: boolean } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatIndex = (req as any).flatIndex;
  const manualOverride =
    flatIndex !== undefined ? overrides?.[flatIndex] : undefined;

  if (manualOverride === true)
    return { isMet: true, isManuallyMet: true, isManuallyNotMet: false };
  if (manualOverride === false)
    return { isMet: false, isManuallyMet: false, isManuallyNotMet: true };

  if (
    req.type?.data === "AndRequirement" ||
    req.type?.data === "OrRequirement"
  ) {
    const subReqs: RequirementResult[] = req.requirements?.data ?? [];
    if (subReqs.length === 0)
      return {
        isMet: req.result?.data ?? false,
        isManuallyMet: false,
        isManuallyNotMet: false,
      };

    if (req.type.data === "AndRequirement") {
      let allMet = true;
      let anyManual = false;
      for (const sub of subReqs) {
        const subRes = evaluateEffectiveMet(sub, overrides);
        if (!subRes.isMet) allMet = false;
        if (subRes.isManuallyMet) anyManual = true;
      }
      return {
        isMet: allMet,
        isManuallyMet: allMet && anyManual,
        isManuallyNotMet: false,
      };
    } else {
      // OrRequirement
      let anyMet = false;
      let anyManual = false;
      for (const sub of subReqs) {
        const subRes = evaluateEffectiveMet(sub, overrides);
        if (subRes.isMet) {
          anyMet = true;
          if (subRes.isManuallyMet) anyManual = true;
        }
      }
      return {
        isMet: anyMet,
        isManuallyMet: anyMet && anyManual,
        isManuallyNotMet: false,
      };
    }
  }

  return {
    isMet: req.result?.data ?? false,
    isManuallyMet: false,
    isManuallyNotMet: false,
  };
}

// Render requirement details that appear below the title
const renderRequirementDetails = (
  req: RequirementResult,
  depth: number,
  allOverrides?: (boolean | null)[],
  onToggleAny?: (index: number, newOverride: boolean | null) => void
) => {
  // Align with requirement text (checkbox space 1.25rem = 20px + gap 0.5rem = 8px = 28px total)
  const textIndent = 28;

  if (req.type?.data === "NumberRequirement") {
    const courses = req.courses?.data ?? [];
    return (
      <div
        style={{
          paddingLeft: `${depth * 24}px`,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <p
          className={styles.metadata}
          style={{ marginLeft: `${textIndent}px` }}
        >
          {req.actual.data} / {req.required.data} units currently satisfying
        </p>
        {courses.length > 0 && (
          <div
            className={styles.courseList}
            style={{ marginLeft: `${textIndent}px` }}
          >
            {courses.map((course: Course, index: number) => (
              <div key={index} className={styles.courseItem}>
                <div className={styles.checkmarkSpace}>
                  <Check className={styles.courseCheckmark} />
                </div>
                <p>
                  {course.subject.data} {course.number.data}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (req.type?.data === "NCoursesRequirement") {
    const courses = req.courses.data ?? [];
    const requiredCount = req.required_count.data;
    const actualCount = req.actual_count?.data ?? courses.length;
    const satisfyCount = Math.min(actualCount, requiredCount);
    return (
      <div
        style={{
          paddingLeft: `${depth * 24}px`,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <p
          className={styles.metadata}
          style={{ marginLeft: `${textIndent}px` }}
        >
          {satisfyCount} / {requiredCount} courses currently satisfying
        </p>
        {courses.length > 0 && (
          <div
            className={styles.courseList}
            style={{ marginLeft: `${textIndent}px` }}
          >
            {courses.map((course: Course, index: number) => (
              <div key={index} className={styles.courseItem}>
                <div className={styles.checkmarkSpace}>
                  <Check className={styles.courseCheckmark} />
                </div>
                <p>
                  {course.subject.data} {course.number.data}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (req.type?.data === "CourseListRequirement") {
    const requiredCourses = req.required_courses.data ?? [];
    const metStatuses = req.met_status.data ?? [];
    const metCount = metStatuses.filter(Boolean).length;
    return (
      <div
        style={{
          paddingLeft: `${depth * 24}px`,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <p
          className={styles.metadata}
          style={{ marginLeft: `${textIndent}px` }}
        >
          {metCount} / {requiredCourses.length} courses currently satisfying
        </p>
        {requiredCourses.length > 0 && (
          <div
            className={styles.courseList}
            style={{ paddingLeft: `${textIndent}px`, boxSizing: "border-box" }}
          >
            {requiredCourses.map((course: Course, index: number) => (
              <div key={index} className={styles.courseItem}>
                <div className={styles.checkmarkSpace}>
                  {metStatuses[index] && (
                    <Check className={styles.courseCheckmark} />
                  )}
                </div>
                <p>
                  {course.subject.data} {course.number.data}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
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

    // Special rendering for the Domain Emphasis OrRequirement —
    // each child AndRequirement is a collapsible sub-accordion.
    if (
      req.type?.data === "OrRequirement" &&
      req.description?.data === "Domain Emphasis"
    ) {
      return (
        <div style={{ marginTop: "0.25rem" }}>
          {subRequirements.map((subReq, index) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const flatIndex = (subReq as any).flatIndex;
            return (
              <div key={`sub-${index}`}>
                {/* Render domain emphases as standard items without 'OR' connectors */}
                {renderRequirementItem(
                  subReq,
                  `de-sub-${index}`,
                  depth + 1,
                  flatIndex ?? -1,
                  flatIndex !== undefined
                    ? allOverrides?.[flatIndex]
                    : undefined,
                  onToggleAny && flatIndex !== undefined
                    ? (newOverride) => onToggleAny(flatIndex, newOverride)
                    : undefined,
                  allOverrides,
                  onToggleAny
                )}
              </div>
            );
          })}
        </div>
      );
    }

    const isAnd = req.type?.data === "AndRequirement";
    const isOr = req.type?.data === "OrRequirement";
    const connector = isAnd ? "AND" : isOr ? "OR" : null;

    return (
      <div
        style={{ marginTop: "0.25rem", width: "100%", boxSizing: "border-box" }}
      >
        {subRequirements.map((subReq, index) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const flatIndex = (subReq as any).flatIndex;
          return (
            <div key={`sub-${index}`}>
              {index > 0 && connector && (
                <div
                  className={styles.connector}
                  style={{
                    paddingLeft: `${textIndent + depth * 24}px`,
                    boxSizing: "border-box",
                  }}
                >
                  {connector}
                </div>
              )}
              {renderRequirementItem(
                subReq,
                `sub-${index}`,
                depth + 1,
                flatIndex ?? -1,
                flatIndex !== undefined ? allOverrides?.[flatIndex] : undefined,
                onToggleAny && flatIndex !== undefined
                  ? (newOverride) => onToggleAny(flatIndex, newOverride)
                  : undefined,
                allOverrides,
                onToggleAny
              )}
            </div>
          );
        })}
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
  allOverrides,
  onToggleAny,
}: {
  req: RequirementResult;
  key: string;
  depth: number;
  requirementIndex: number; // -1 for nested requirements that don't support manual override
  manualOverride?: boolean | null;
  onToggleManualOverride?: (newOverride: boolean | null) => void;
  allOverrides?: (boolean | null)[];
  onToggleAny?: (index: number, newOverride: boolean | null) => void;
}) {
  // requirementIndex is used by parent component when calling onToggleManualOverride
  void requirementIndex;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatIndex = (req as any).flatIndex;

  const overridesWithoutThis = allOverrides ? [...allOverrides] : [];
  if (flatIndex !== undefined) {
    overridesWithoutThis[flatIndex] = null; // pretend it wasn't manually overridden
  }

  const { isMet: nonOverriddenIsMet } = evaluateEffectiveMet(
    req,
    overridesWithoutThis
  );

  const {
    isMet: isEffectivelyMet,
    isManuallyMet: isManuallyOverridden,
    isManuallyNotMet,
  } = evaluateEffectiveMet(req, allOverrides);

  // Default: expanded if incomplete, collapsed if complete
  const [isExpanded, setIsExpanded] = useState(!isEffectivelyMet);
  const [isHovered, setIsHovered] = useState(false);

  // Check if this requirement has details to show
  const hasDetails =
    req.type?.data === "NumberRequirement" ||
    req.type?.data === "NCoursesRequirement" ||
    req.type?.data === "CourseListRequirement" ||
    req.type?.data === "AndRequirement" ||
    req.type?.data === "OrRequirement";

  const handleCheckClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleManualOverride) {
      let newOverride: boolean | null;
      if (nonOverriddenIsMet) {
        // Natively MET (either automatically or by children). Toggle between Green/Gray (null) and Invisible (false).
        if (manualOverride === false) {
          newOverride = null;
        } else {
          newOverride = false;
        }
      } else {
        // Natively UNMET. Toggle between Invisible (null/false) and Gray (true).
        if (manualOverride === true) {
          newOverride = false;
        } else {
          newOverride = true;
        }
      }

      onToggleManualOverride(newOverride);

      const newIsManuallyOverridden = newOverride === true;
      const newIsManuallyNotMet = newOverride === false;
      const newIsEffectivelyMet =
        newIsManuallyOverridden || (nonOverriddenIsMet && !newIsManuallyNotMet);

      // Expand if incomplete, collapse if complete
      setIsExpanded(!newIsEffectivelyMet);
    }
  };

  return (
    <div
      key={itemKey}
      className={styles.item}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={styles.element}
        style={{ paddingLeft: `${depth * 24}px`, boxSizing: "border-box" }}
      >
        <div className={styles.start}>
          <div
            className={classNames(styles.checkmarkSpace, {
              [styles.clickable]: !!onToggleManualOverride,
            })}
            onClick={handleCheckClick}
            title={
              onToggleManualOverride
                ? isManuallyOverridden || isManuallyNotMet
                  ? "Click to remove manual override"
                  : "Click to manually toggle status"
                : undefined
            }
          >
            <Check
              className={classNames(styles.reqCheckmark, {
                [styles.visible]:
                  isEffectivelyMet || (isHovered && !!onToggleManualOverride),
                [styles.hover]:
                  !isEffectivelyMet && isHovered && !!onToggleManualOverride,
                [styles.auto]:
                  isEffectivelyMet &&
                  !isManuallyOverridden &&
                  !isManuallyNotMet,
                [styles.manual]: isManuallyOverridden,
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
      {isExpanded &&
        hasDetails &&
        renderRequirementDetails(req, depth, allOverrides, onToggleAny)}
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
  onToggleManualOverride?: (newOverride: boolean | null) => void,
  allOverrides?: (boolean | null)[],
  onToggleAny?: (index: number, newOverride: boolean | null) => void
) => {
  return (
    <RequirementItem
      req={req}
      key={key}
      depth={depth}
      requirementIndex={requirementIndex}
      manualOverride={manualOverride}
      onToggleManualOverride={onToggleManualOverride}
      allOverrides={allOverrides}
      onToggleAny={onToggleAny}
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

      const groups: EvaluatedRequirementGroup[] = [];
      const foundMajors = new Set<string>();
      const foundMinors = new Set<string>();

      // fetch course data for ALL courses in the plan
      const allPlanCourses = planTerms.flatMap((t) => t.courses);
      const uniqueCoursesMap = new Map<
        string,
        (typeof allPlanCourses)[0] & {
          course?: NonNullable<GetCourseRequirementsQuery["course"]>;
        }
      >();
      for (const c of allPlanCourses) {
        const key = c.courseName;
        if (!uniqueCoursesMap.has(key)) uniqueCoursesMap.set(key, c);
      }

      await Promise.all(
        Array.from(uniqueCoursesMap.values()).map(async (c) => {
          const [subject, ...rest] = c.courseName.split(" ");
          const number = rest.join(" ");
          try {
            const result = await apolloClient.query({
              query: GetCourseRequirementsDocument,
              variables: { subject, number },
              fetchPolicy: "network-only",
              errorPolicy: "all",
            });
            if (result.data?.course) {
              uniqueCoursesMap.set(c.courseName, {
                ...c,
                course: result.data.course,
              });
            }
          } catch {
            // intentionally silent — course enrichment is best-effort
          }
        })
      );

      // Rebuild enriched columns with course data
      const enrichedPlanTerms = planTerms.map((term) => ({
        ...term,
        courses: term.courses.map(
          (c) => uniqueCoursesMap.get(c.courseName) ?? c
        ),
      }));
      const columns = enrichedPlanTerms.map(columnAdapter);

      const fetchCourse = async (subject: string, number: string) => {
        try {
          const result = await apolloClient.query({
            query: GetCourseRequirementsDocument,
            variables: { subject, number },
            errorPolicy: "all",
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

      for (const spr of plan.selectedPlanRequirements) {
        if (!spr.planRequirement) continue;

        const req = spr.planRequirement;

        if (req.major) foundMajors.add(req.major);
        if (req.minor) foundMinors.add(req.minor);

        const commonVars = new Map<string, Data<unknown>>([
          ["this", { data: planAdapter(plan, columns), type: "Plan" }],
          ["columns", { data: columns, type: "List<Column>" }],
        ]);

        const config = { debug: false, fetchCourse };
        const evaluated = init(req.code, commonVars, config) as
          | RequirementResult[]
          | null;

        if (Array.isArray(evaluated) && evaluated.length > 0) {
          // Flatten nested requirements onto a continuous index track, starting roots at 0
          // so existing database overrides aren't broken.
          let counter = evaluated.length;

          evaluated.forEach((req, index) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (req as any).flatIndex = index;
          });

          const assignChildren = (reqs: RequirementResult[]) => {
            for (const req of reqs) {
              if (
                req.type?.data === "AndRequirement" ||
                req.type?.data === "OrRequirement"
              ) {
                const subReqs = req.requirements?.data ?? [];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                subReqs.forEach((sub: any) => {
                  sub.flatIndex = counter++;
                });
                assignChildren(subReqs);
              }
            }
          };
          assignChildren(evaluated);
          const totalNodes = counter;

          const currentOverrides = spr.manualOverrides ?? [];
          const paddedOverrides = Array.from({ length: totalNodes }).map(
            (_, i) => (i < currentOverrides.length ? currentOverrides[i] : null)
          );

          const newSpr = {
            ...spr,
            manualOverrides: paddedOverrides,
          };

          groups.push({
            title: req.name,
            requirements: evaluated,
            source: req,
            selectedPlanRequirement: newSpr,
          });
        }
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

  if (isLoading && evaluatedGroups.length === 0) {
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

  // Removed allFulfilled checkmark calculation as user preferred manual monitoring

  const handleToggleManualOverride = async (
    requirementIndex: number,
    newOverride: boolean | null
  ) => {
    if (!selectedPlanRequirement?.planRequirement?._id) return;

    try {
      await apolloClient.mutate({
        mutation: UpdateManualOverrideDocument,
        variables: {
          input: {
            planRequirementId: selectedPlanRequirement.planRequirement._id,
            requirementIndex,
            // Pass null explicitly when clearing so the backend persists "no override"
            manualOverride: newOverride,
          },
        },
        optimisticResponse: undefined,
        update: (cache, { data }) => {
          if (!data?.updateManualOverride) return;

          // Directly update the cached selectedPlanRequirement
          cache.modify({
            id: cache.identify(selectedPlanRequirement),
            fields: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              manualOverrides: (existingOverrides: any) => {
                const newOverrides = Array.isArray(existingOverrides)
                  ? [...existingOverrides]
                  : [];
                // Ensure array has enough elements
                while (newOverrides.length <= requirementIndex) {
                  newOverrides.push(null);
                }
                newOverrides[requirementIndex] = newOverride;
                return newOverrides;
              },
            },
          });
        },
      });
    } catch (error) {
      console.error("Failed to update manual override:", error);
    }
  };

  return (
    <div className={styles.accordion}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const flatIndex = (req as any).flatIndex ?? index;
            const manualOverride =
              selectedPlanRequirement?.manualOverrides?.[flatIndex];
            return renderRequirementItem(
              req,
              `req-${flatIndex}`,
              0,
              flatIndex,
              manualOverride,
              (newOverride) =>
                handleToggleManualOverride(flatIndex, newOverride),
              selectedPlanRequirement?.manualOverrides,
              handleToggleManualOverride
            );
          })}
        </div>
      )}
    </div>
  );
}
