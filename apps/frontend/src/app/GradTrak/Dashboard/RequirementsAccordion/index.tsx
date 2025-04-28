import { useState, useEffect, useRef } from 'react'; 

import { Check, NavArrowDown, NavArrowRight, MoreHoriz } from 'iconoir-react'; 

import { UniReqs, LnSReqs, CoEReqs, HaasReqs } from '@/lib/course'; 

import "./RequirementsAccordion.scss"; 

type RequirementEnum = UniReqs | LnSReqs | CoEReqs | HaasReqs;

interface RequirementsAccordionProps {
    title: string;
    requirements?: RequirementEnum[];
}

export default function RequirementsAccordion({ title, requirements }: RequirementsAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [fulfilledRequirements, setFulfilledRequirements] = useState<Set<RequirementEnum>>(new Set());
    const [hoveredRequirement, setHoveredRequirement] = useState<RequirementEnum | null>(null);
    const [activeMenuRequirement, setActiveMenuRequirement] = useState<RequirementEnum | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);

    const toggleAccordion = () => {
        setIsExpanded(prev => !prev);
        setActiveMenuRequirement(null);
    };

    const handleMouseEnter = (requirement: RequirementEnum) => {
        setHoveredRequirement(requirement);
    };

    const handleMouseLeave = () => {
        setHoveredRequirement(null);
    };

    const openMenu = (requirement: RequirementEnum) => {
        setActiveMenuRequirement(requirement);
    };

    const closeMenu = () => {
        setActiveMenuRequirement(null);
    };

    const markAsFulfilled = (requirement: RequirementEnum) => {
        const newFulfilledRequirements = new Set(fulfilledRequirements);
        newFulfilledRequirements.add(requirement);
        setFulfilledRequirements(newFulfilledRequirements);
        closeMenu();
    };

    const markAsUnfulfilled = (requirement: RequirementEnum) => {
        const newFulfilledRequirements = new Set(fulfilledRequirements);
        newFulfilledRequirements.delete(requirement);
        setFulfilledRequirements(newFulfilledRequirements);
        closeMenu();
    };

    useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            if (activeMenuRequirement !== null && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                 const ellipsisButton = (event.target as HTMLElement).closest('.ellipsis-button');
                 if (!ellipsisButton) {
                     setActiveMenuRequirement(null);
                 }
            }
        };

        if (activeMenuRequirement !== null) {
            document.addEventListener('mousedown', handleMouseDown, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleMouseDown, true);
        };
    }, [activeMenuRequirement]); 


    return (
        <div className="accordion">
            <div className="sidepanel-header-container">
                <div className="requirement-header">{title}</div>
                 <button className="accordion-toggle-button" onClick={toggleAccordion} aria-expanded={isExpanded}>
                   {isExpanded ? <NavArrowDown className="icon" /> : <NavArrowRight className="icon" /> }
                 </button>
            </div>

            {isExpanded && (
                <div className="accordion-contents">
                    {requirements && requirements.length > 0 ? (
                        requirements.map((requirement, index) => {
                            const isFulfilled = fulfilledRequirements.has(requirement);

                            return (
                                <div
                                    key={requirement} 
                                    className={`accordion-item ${isFulfilled ? "fulfilled" : "pending"}`}
                                    onMouseEnter={() => handleMouseEnter(requirement)}
                                    onMouseLeave={handleMouseLeave}
                                    style={{ position: 'relative' }}
                                >
                                    <div className="item-wrapper">
                                        <div className="item-start">
                                            <div className="checkmark-space">
                                                {isFulfilled && <Check className="checkmark-icon" />}
                                            </div>
                                            <p className="requirement-text">{requirement}</p>
                                        </div>
                                        <button
                                            className={`ellipsis-button ${hoveredRequirement === requirement || activeMenuRequirement === requirement ? 'visible' : ''}`}
                                            onClick={(e) => {
                                                 e.stopPropagation(); 
                                                 openMenu(requirement);
                                            }}
                                            aria-label={`Options for ${requirement}`} 
                                        >
                                            <MoreHoriz /> 
                                        </button>
                                    </div>

                                    {activeMenuRequirement === requirement && (
                                        <div className="requirement-menu-popover" ref={menuRef}>
                                            <button className="menu-item" onClick={() => { isFulfilled ? markAsUnfulfilled(requirement) : markAsFulfilled(requirement); }}>
                                                {isFulfilled ? 'Mark as Unfulfilled' : 'Mark as Fulfilled'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="no-requirements-message">No requirements listed for this category.</p>
                    )}
                </div>
            )}
        </div>
    );
}