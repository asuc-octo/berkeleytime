import { Separator } from "@radix-ui/themes";
import RequirementsAccordion from "../RequirementsAccordion";
import { UniReqs, LnSReqs, CoEReqs, HaasReqs } from '@/lib/course';

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
        <div>
            <div className="sidepanel-header-container">
                <div className="user-header">
                    <h2 className="user-name truncate">{name}</h2>
                    <p className="graduation-plan">Graduation Plan</p>
                </div>
                <button className="panel-secondary">Edit</button>
            </div>
            <div className="user-info-grid">
                {/* Majors */}
                <div className="label">Major(s)</div>
                <div className="value">
                    <ul>{majors.map((major, index) => (<li key={index}>{major}</li>))}</ul>
                </div>

                {/* Minors */}
                {minors.length > 0 && (
                    <>
                        <div className="label">Minor(s)</div>
                        <div className="value">
                            <ul>{minors.map((minor, index) => (<li key={index}>{minor}</li>))}</ul>
                        </div>
                    </>
                )}

                {/* Total Units */}
                <div className="label">Total Units</div>
                <div className="value">{totalUnits}</div>

                {/* Transfer Units */}
                <div className="label">Transfer Units</div>
                <div className="value">{transferUnits}</div>

                 {/* P/NP Total */}
                <div className="label">P/NP Total</div>
                <div className="value">{pnpTotal}</div>
            </div>       
        </div>
    );

    const MajorRequirements = (
        <div>
            {majors.map((major, index) => (
              <>
                <div className="sidepanel-container accordion">
                    <div className="sidepanel-header-container">
                        <div className="user-header">
                            <h2 className="user-name truncate" key={index}>{major}</h2>
                        </div>
                    </div>
                    <div className="accordion-contents">
                    <div className="accordion-item ">
                        <p className="units-title">Upper Division Units: </p>
                        <p className="units-comp">0/8</p>
                    </div>
                    <div className="accordion-item ">
                        <p className="units-title">Lower Division Units: </p>
                        <p className="units-comp">0/8</p>
                    </div>
                    <div className="accordion-item ">
                        <p className="units-title">Elective Units: </p>
                        <p className="units-comp">0/7</p>
                    </div>
                    </div>
                </div>
                <div className="separator" />   
              </>
            ))}
        </div>
    )

    const MinorRequirements = (
        <div>
            {minors.map((minor, index) => (
            <>
              <div className="sidepanel-container accordion">
                    <div className="sidepanel-header-container">
                        <div className="user-header">
                            <h2 className="user-name truncate" key={index}>{minor}</h2>
                        </div>
                    </div>
                    <div className="accordion-contents">
                    <div className="accordion-item ">
                        <p className="units-title">Upper Division Units: </p>
                        <p className="units-comp">0/8</p>
                    </div>
                    <div className="accordion-item ">
                        <p className="units-title">Lower Division Units: </p>
                        <p className="units-comp">0/8</p>
                    </div>
                    <div className="accordion-item ">
                        <p className="units-title">Elective Units: </p>
                        <p className="units-comp">0/7</p>
                    </div>
                    </div>
                </div>
                <div className="separator" />     
              </>  
            ))}
        </div>
    )

    return (
        <div className={style.root}>
            {UserInfo}
            <div className="separator" /> 
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
            <div className="separator" />     
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
            <div className="separator" />    
        </div>
   )
}