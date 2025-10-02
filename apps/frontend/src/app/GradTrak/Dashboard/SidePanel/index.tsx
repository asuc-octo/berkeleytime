// TODO: also import in CoEReqs, HaasReqs
import { useState } from "react";

import { WarningCircle } from "iconoir-react";

import {
  // CoEReqs,
  // HaasReqs,
  LnSReqs,
  RequirementEnum,
  UniReqs,
} from "@/lib/course";

import RequirementsAccordion from "./RequirementsAccordion";
import styles from "./SidePanel.module.scss";

// TODO(Daniel): Implement proper handling of reqs based on user's college...
interface SidePanelProps {
  majors: string[];
  minors: string[];
  totalUnits: number;
  transferUnits: number;
  pnpTotal: number;
  uniReqsFulfilled: RequirementEnum[];
  collegeReqsFulfilled: RequirementEnum[];
}

export default function SidePanel({
  majors,
  minors,
  totalUnits,
  transferUnits,
  pnpTotal,
  uniReqsFulfilled,
  collegeReqsFulfilled,
}: SidePanelProps) {
  const [collegeReqs] = useState<RequirementEnum[]>([
    LnSReqs.LnS_AL,
    LnSReqs.LnS_BS,
    LnSReqs.LnS_HS,
    LnSReqs.LnS_IS,
    LnSReqs.LnS_PV,
    LnSReqs.LnS_PS,
    LnSReqs.LnS_SBS,
  ]);
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
      </div>
    </>
  );

  const MajorRequirements = (
    <div>
      {majors.map((major, index) => (
        <div key={index}>
          <div className={styles.separator} />
          <div className={styles.accordion}>
            <h2>{major}</h2>
            <div className={styles.body}>
              <div className={styles.item}>
                <p className={styles.label}>Upper Division Units: </p>
                <p className={styles.units}>0/8</p>
              </div>
              <div className={styles.item}>
                <p className={styles.label}>Lower Division Units: </p>
                <p className={styles.units}>0/8</p>
              </div>
              <div className={styles.item}>
                <p className={styles.label}>Elective Units: </p>
                <p className={styles.units}>0/7</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const MinorRequirements = (
    <div>
      {minors.map((minor, index) => (
        <div key={index}>
          <div className={styles.separator} />
          <div className={styles.accordion}>
            <h2>{minor}</h2>
            <div className={styles.body}>
              <div className={styles.item}>
                <p className={styles.label}>Upper Division Units: </p>
                <p className={styles.units}>0/8</p>
              </div>
              <div className={styles.item}>
                <p className={styles.label}>Lower Division Units: </p>
                <p className={styles.units}>0/8</p>
              </div>
              <div className={styles.item}>
                <p className={styles.label}>Elective Units: </p>
                <p className={styles.units}>0/7</p>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className={styles.separator} />
    </div>
  );

  return (
    <div className={styles.root}>
      {UserInfo}
      {MajorRequirements}
      {MinorRequirements}
      <RequirementsAccordion
        title={"University of California"}
        uni={true}
        requirements={[
          UniReqs.AC,
          UniReqs.AH,
          UniReqs.AI,
          UniReqs.CW,
          UniReqs.QR,
          UniReqs.RCA,
          UniReqs.RCB,
          UniReqs.FL,
        ]}
        finishedRequirements={uniReqsFulfilled}
      />
      <RequirementsAccordion
        title={"Breadth Requirements"}
        uni={false}
        requirements={collegeReqs}
        finishedRequirements={collegeReqsFulfilled}
      />
    </div>
  );
}
