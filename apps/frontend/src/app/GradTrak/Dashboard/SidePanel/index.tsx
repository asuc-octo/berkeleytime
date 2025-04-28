import RequirementsAccordion from "../RequirementsAccordion";
import { UniReqs, LnSReqs, CoEReqs, HaasReqs } from '@/lib/course';
import { Button } from "@repo/theme"

import style from "./SidePanel.module.scss";

// TODO: function checkRequirementFulfilled()
// TODO: Implement proper handling of reqs based on user's college...
  
interface SidePanelProps {
    name: string;
    majors: string[];
    minors: string[];
    totalUnits: number;
    transferUnits: number;
    pnpTotal: number;
}

export default function SidePanel({ name, majors, minors, totalUnits, transferUnits, pnpTotal}: SidePanelProps) {

    const UserInfo = (
        <div className={style.headerContainer}>
            <div className={style.header}>
                <div className={style.title}>
                    <h2 className={style.truncate}>{name}</h2>
                    <p className={style.subtitle}>Graduation Plan</p>
                </div>
                <Button variant="outline">Edit</Button>
            </div>
            <div className={style.grid}>
                {/* Majors */}
                <div className={style.label}>Major(s)</div>
                <div className={style.value}>
                    <ul>{majors.map((major, index) => (<li key={index}>{major}</li>))}</ul>
                </div>

                {/* Minors */}
                {minors.length > 0 && (
                    <>
                        <div className={style.label}>Minor(s)</div>
                        <div className={style.value}>
                            <ul>{minors.map((minor, index) => (<li key={index}>{minor}</li>))}</ul>
                        </div>
                    </>
                )}

                {/* Total Units */}
                <div className={style.label}>Total Units</div>
                <div className={style.value}>{totalUnits}</div>

                {/* Transfer Units */}
                <div className={style.label}>Transfer Units</div>
                <div className={style.value}>{transferUnits}</div>

                 {/* P/NP Total */}
                <div className={style.label}>P/NP Total</div>
                <div className={style.value}>{pnpTotal}</div>
            </div>       
        </div>
    );

    const MajorRequirements = (
        <div>
            {majors.map((major, index) => (
              <>
                <div className={style.accordion}>
                    <h2 key={index}>{major}</h2>
                    <div className={style.body}>
                        <div className={style.item}>
                            <p className={style.label}>Upper Division Units: </p>
                            <p className={style.units}>0/8</p>
                        </div>
                        <div className={style.item}>
                            <p className={style.label}>Lower Division Units: </p>
                            <p className={style.units}>0/8</p>
                        </div>
                        <div className={style.item}>
                            <p className={style.label}>Elective Units: </p>
                            <p className={style.units}>0/7</p>
                        </div>
                    </div>
                </div>
                <div className={style.separator}/>   
              </>
            ))}
        </div>
    )

    const MinorRequirements = (
        <div>
            {minors.map((minor, index) => (
            <>
                <div className={style.accordion}>
                    <h2 key={index}>{minor}</h2>
                    <div className={style.body}>
                        <div className={style.item}>
                            <p className={style.label}>Upper Division Units: </p>
                            <p className={style.units}>0/8</p>
                        </div>
                        <div className={style.item}>
                            <p className={style.label}>Lower Division Units: </p>
                            <p className={style.units}>0/8</p>
                        </div>
                        <div className={style.item}>
                            <p className={style.label}>Elective Units: </p>
                            <p className={style.units}>0/7</p>
                        </div>
                    </div>
                </div>
                <div className={style.separator}/>   
            </>  
            ))}
        </div>
    )

    return (
        <div className={style.root}>
            {UserInfo}
            <div className={style.separator}/>   
            {MajorRequirements}
            {MinorRequirements}  
            <RequirementsAccordion title={"University of California"}
                requirements={[
                    UniReqs.AC,
                    UniReqs.AH,
                    UniReqs.AI,
                    UniReqs.CW,
                    UniReqs.QR,
                    UniReqs.RCA,
                    UniReqs.RCB,
                    UniReqs.FL,
                ]}/>     
            <RequirementsAccordion title={"Breadth Requirements"}    
                requirements={[
                    LnSReqs.LnS_AL,
                    LnSReqs.LnS_BS,
                    LnSReqs.LnS_HS,
                    LnSReqs.LnS_IS,
                    LnSReqs.LnS_PV,
                    LnSReqs.LnS_PS,
                    LnSReqs.LnS_SBS,
                ]}/>
        </div>
   )
}