import { Separator } from "@radix-ui/themes";
import RequirementsAccordion from "../RequirementsAccordion/RequirementsAccordion";
import "./SidePanel.css";
import { Uni_Reqs, College_Reqs } from '@/lib/api';

// TODO: function checkRequirementFulfilled()
// TODO: Implement proper requirements enum...
  
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
        <div className="sidepanel-container">
            <div className="sidepanel-header-container">
                <div className="user-header">
                    <h2 className="truncate">{name}</h2>
                    <h2 className="secondary-text">Graduation Plan</h2>
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
                            <h2 className="truncate" key={index}>{major}</h2>
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
                <Separator size="4" />     
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
                            <h2 className="truncate" key={index}>{minor}</h2>
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
                <Separator size="4" />     
              </>  
            ))}
        </div>
    )

    return (
        <div className='sidepanel'>
            {UserInfo}
            <Separator size="4" /> 
            {MajorRequirements}
            {MinorRequirements}  
            <RequirementsAccordion title={"University of California"}
                requirements={[
                    Uni_Reqs.AC,
                    Uni_Reqs.AH,
                    Uni_Reqs.AI,
                    Uni_Reqs.CW,
                    Uni_Reqs.QR,
                    Uni_Reqs.RCA,
                    Uni_Reqs.RCB,
                    Uni_Reqs.FL,
                ]}/>
            <Separator size="4" />     
            <RequirementsAccordion title={"Breadth Requirements"}    
                requirements={[
                    College_Reqs.LnS_AL,
                    College_Reqs.LnS_BS,
                    College_Reqs.LnS_HS,
                    College_Reqs.LnS_IS,
                    College_Reqs.LnS_PV,
                    College_Reqs.LnS_PS,
                    College_Reqs.LnS_SBS,
                ]}/>
            <Separator size="4" />    
        </div>
   )
}