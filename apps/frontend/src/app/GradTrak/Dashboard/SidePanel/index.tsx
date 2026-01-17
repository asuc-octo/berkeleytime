import { useState } from "react";

import { SidebarCollapse, SidebarExpand, WarningCircle } from "iconoir-react";

import { IPlan, IPlanTerm } from "@/lib/api";
import { RequirementEnum } from "@/lib/course";
import { Colleges } from "@/lib/generated/graphql";
import { GetCourseRequirementsQuery } from "@/lib/generated/graphql";

import BtLLGradTrakInterface from "../../BtLLInterface";
import styles from "./SidePanel.module.scss";

// TODO(Daniel): Implement proper handling of reqs based on user's college...
interface SidePanelProps {
  colleges: Colleges[];
  majors: string[];
  minors: string[];
  totalUnits: number;
  transferUnits: number;
  pnpTotal: number;
  uniReqsFulfilled: RequirementEnum[];
  collegeReqsFulfilled: RequirementEnum[];
  plan?: IPlan;
  planTerms?: (IPlanTerm & {
    courses: (import("@/lib/api").ISelectedCourse & {
      course?: NonNullable<GetCourseRequirementsQuery["course"]>;
    })[];
  })[];
}

export default function SidePanel({
  colleges,
  majors,
  minors,
  totalUnits,
  transferUnits,
  pnpTotal,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uniReqsFulfilled: _uniReqsFulfilled,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  collegeReqsFulfilled: _collegeReqsFulfilled,
  plan,
  planTerms,
}: SidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const Header = (
    <>
      <div className={styles.headerContainer}>
        <h1 className={styles.header}>GradTrak</h1>
        <button
          className={styles.collapseButton}
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <SidebarExpand className={styles.collapseIcon} />
          ) : (
            <SidebarCollapse className={styles.collapseIcon} />
          )}
        </button>
      </div>
    </>
  );

  const UserInfo = (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.grid}>
          {/* Majors */}
          <div className={styles.label}>Major(s)</div>
          <div className={styles.value}>
            <ul>
              {majors.map((major, index) => (
                <li key={index}>{major}</li>
              ))}
            </ul>
          </div>

          {/* Minors */}
          {minors.length > 0 && (
            <>
              <div className={styles.label}>Minor(s)</div>
              <div className={styles.value}>
                <ul>
                  {minors.map((minor, index) => (
                    <li key={index}>{minor}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Total Units */}
          <div className={styles.label}>Total Units</div>
          <div className={styles.value}>{totalUnits}</div>

          {/* Transfer Units */}
          <div className={styles.label}>Transfer Units</div>
          <div className={styles.value}>{transferUnits}</div>

          {/* P/NP Total */}
          <div className={styles.label}>P/NP Total</div>
          <div className={styles.value}>{pnpTotal}</div>
        </div>
        <div className={styles.disclaimer}>
          <WarningCircle className={styles.icon} />
          <div className={styles.text}>
            Future courses may not to be offered each semester. Remember to
            check!
          </div>
        </div>
        <div className={styles.disclaimer}>
          <WarningCircle className={styles.icon} />
          <div className={styles.text}>
            Requirements may not be 100% accurate. Always verify with an
            academic advisor or CalCentral.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={`${styles.root} ${isCollapsed ? styles.collapsed : ""}`}>
      {Header}
      {!isCollapsed && (
        <>
          {UserInfo}
          <BtLLGradTrakInterface
            plan={plan}
            planTerms={planTerms}
            majors={majors}
            minors={minors}
            colleges={colleges}
          />
        </>
      )}
    </div>
  );
}
