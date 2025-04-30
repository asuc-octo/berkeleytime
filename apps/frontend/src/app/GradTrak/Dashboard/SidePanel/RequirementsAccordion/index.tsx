import { useState, useEffect, useRef } from 'react'; 
import { 
    Check, 
    NavArrowDown, 
    NavArrowRight, 
    MoreHoriz 
} from 'iconoir-react'; 

import { 
    UniReqs, 
    LnSReqs, 
    CoEReqs, 
    HaasReqs 
} from '@/lib/course'; 

import styles from "./RequirementsAccordion.module.scss"; 

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
        <div className={styles.accordion}>
            <div className={styles.header}>
                <div className={styles.title}>{title}</div>
                 <button className={styles.toggle} onClick={toggleAccordion} aria-expanded={isExpanded}>
                   {isExpanded ? <NavArrowDown className={styles.icon}/> : <NavArrowRight className={styles.icon}/>}
                 </button>
            </div>

            {isExpanded && (
                <div className={styles.body}>
                    {requirements && requirements.length > 0 ? (
                        requirements.map((requirement, index) => {
                            const isFulfilled = fulfilledRequirements.has(requirement);

                            return (
                                <div
                                    key={requirement} 
                                    className={`${styles.item} ${isFulfilled ? styles.fulfilled : styles.pending}`}
                                    onMouseEnter={() => handleMouseEnter(requirement)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className={styles.element}>
                                        <div className={styles.start}>
                                            <div className={styles.checkmarkSpace}>
                                                {isFulfilled && <Check className={styles.checkmarkIcon}/>}
                                            </div>
                                            <p>{requirement}</p>
                                        </div>
                                        <button
                                            className={`${styles.ellipsis} ${hoveredRequirement === requirement || activeMenuRequirement === requirement ? styles.visible : ''}`}
                                            onClick={(e) => {
                                                 e.stopPropagation(); 
                                                 openMenu(requirement);
                                            }}
                                            aria-label={`Options for ${requirement}`} 
                                        >
                                            <MoreHoriz className={styles.moreHoriz}/> 
                                        </button>
                                    </div>

                                    {activeMenuRequirement === requirement && (
                                        <div className={styles.popover} ref={menuRef}>
                                            <button className={styles.item} onClick={() => { isFulfilled ? markAsUnfulfilled(requirement) : markAsFulfilled(requirement) }}>
                                                <div className={styles.start}>
                                                    <Check className={styles.icon}/>
                                                    {isFulfilled ? 'Mark as Unfulfilled' : 'Mark as Fulfilled'}
                                                </div>
                                                <p className={styles.icon}>M</p>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p>No requirements listed for this category.</p>
                    )}
                </div>
            )}
        </div>
    );
}