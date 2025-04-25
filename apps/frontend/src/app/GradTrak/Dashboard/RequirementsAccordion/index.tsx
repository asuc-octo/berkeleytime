import { useState, useEffect, useRef } from 'react'; // Import useEffect, useRef

// Import icons
import { Check, NavArrowDown, NavArrowRight, MoreHoriz } from 'iconoir-react'; // Keep MoreHoriz

// Import the specific requirement types that will be passed
import { UniReqs, LnSReqs, CoEReqs, HaasReqs } from '@/lib/course'; // Assuming these are the correct enums

import "./RequirementsAccordion.scss"; // Use SCSS

// Define the union type for possible requirements
type RequirementEnum = UniReqs | LnSReqs | CoEReqs | HaasReqs;

interface RequirementsAccordionProps {
    title: string;
    // Use the union type for the requirements prop, allow undefined
    requirements?: RequirementEnum[];
}

export default function RequirementsAccordion({ title, requirements }: RequirementsAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    // Use the union type in the Set state
    const [fulfilledRequirements, setFulfilledRequirements] = useState<Set<RequirementEnum>>(new Set());
    // Use the union type for the hovered requirement state
    const [hoveredRequirement, setHoveredRequirement] = useState<RequirementEnum | null>(null);
    // Use the union type for the active menu requirement state
    const [activeMenuRequirement, setActiveMenuRequirement] = useState<RequirementEnum | null>(null);

    // Ref for the menu popover to detect clicks outside
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleAccordion = () => {
        setIsExpanded(prev => !prev);
        // Close the menu when collapsing the accordion
        setActiveMenuRequirement(null);
    };

    // Use the union type for function parameters
    const handleMouseEnter = (requirement: RequirementEnum) => {
        setHoveredRequirement(requirement);
    };

    const handleMouseLeave = () => {
        setHoveredRequirement(null);
    };

    // Use the union type for function parameters
    const openMenu = (requirement: RequirementEnum) => {
        setActiveMenuRequirement(requirement);
    };

    const closeMenu = () => {
        setActiveMenuRequirement(null);
    };

    // Use the union type for function parameters
    const markAsFulfilled = (requirement: RequirementEnum) => {
        const newFulfilledRequirements = new Set(fulfilledRequirements);
        newFulfilledRequirements.add(requirement);
        setFulfilledRequirements(newFulfilledRequirements);
        // Close menu after action
        closeMenu();
    };

    // Use the union type for function parameters
    const markAsUnfulfilled = (requirement: RequirementEnum) => {
        const newFulfilledRequirements = new Set(fulfilledRequirements);
        newFulfilledRequirements.delete(requirement);
        setFulfilledRequirements(newFulfilledRequirements);
        // Close menu after action
        closeMenu();
    };

    // Effect to handle clicks outside the menu popover
    useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            // Close the menu if clicking outside the menu popover and the ellipsis button
            // Check if the click target is NOT inside the menu popover AND
            // NOT the ellipsis button that opened the menu
            // Check if a menu is actually open before proceeding
            if (activeMenuRequirement !== null && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                 // Check if the click was *directly* on the ellipsis button for *any* item
                 const ellipsisButton = (event.target as HTMLElement).closest('.ellipsis-button');
                 // If the click was not within the menu popover AND was not on an ellipsis button, close the menu
                 // (Clicking an ellipsis button should open a *new* menu, not close an existing one unless it's the same item)
                 if (!ellipsisButton) {
                     setActiveMenuRequirement(null);
                 }
            }
        };

        // Add event listener when a menu is active
        if (activeMenuRequirement !== null) {
            // Use capture phase to ensure this runs before potential clicks on items below
            document.addEventListener('mousedown', handleMouseDown, true);
        }

        // Clean up event listener
        return () => {
            // Ensure the listener is removed from the correct phase
            document.removeEventListener('mousedown', handleMouseDown, true);
        };
    }, [activeMenuRequirement]); // Re-run effect when activeMenuRequirement changes


    return (
        <div className="accordion">
            {/* Accordion header */}
            {/* Removed onClick={toggleAccordion} from sidepanel-header-container to put it on a dedicated button for better a11y */}
            <div className="sidepanel-header-container">
                <div className="requirement-header">{title}</div>
                 {/* Use a button for the toggle action */}
                 <button className="accordion-toggle-button" onClick={toggleAccordion} aria-expanded={isExpanded}>
                   {isExpanded ? <NavArrowDown className="icon" /> : <NavArrowRight className="icon" /> }
                 </button>
            </div>

            {/* Conditionally render contents only when expanded */}
            {isExpanded && (
                <div className="accordion-contents">
                    {/* Check if requirements array exists and is not empty before mapping */}
                    {requirements && requirements.length > 0 ? (
                        requirements.map((requirement, index) => {
                            // Check if the requirement is currently marked as fulfilled in our state
                            const isFulfilled = fulfilledRequirements.has(requirement);

                            return (
                                <div
                                    key={requirement} // Use requirement string as key if unique, more stable than index
                                    className={`accordion-item ${isFulfilled ? "fulfilled" : "pending"}`}
                                    onMouseEnter={() => handleMouseEnter(requirement)}
                                    onMouseLeave={handleMouseLeave}
                                    // Add class to make it a positioning context for the popover
                                    style={{ position: 'relative' }}
                                >
                                    {/* Wrapper for flex layout - using the class item-wrapper for consistency */}
                                    <div className="item-wrapper">
                                        {/* Left side: Checkmark and Text */}
                                        <div className="item-start">
                                             {/* --- FIX APPLIED HERE: Fixed-width container for the checkmark --- */}
                                            <div className="checkmark-space">
                                                {isFulfilled && <Check className="checkmark-icon" />}
                                            </div>
                                             {/* --- END FIX --- */}
                                            <p className="requirement-text">{requirement}</p>
                                        </div>
                                        {/* Right side: Ellipsis Trigger */}
                                        {/* Use a button for click target */}
                                        <button
                                            className={`ellipsis-button ${hoveredRequirement === requirement || activeMenuRequirement === requirement ? 'visible' : ''}`}
                                            onClick={(e) => {
                                                 e.stopPropagation(); // Prevent accordion from toggling when clicking ellipsis
                                                 openMenu(requirement);
                                            }}
                                            aria-label={`Options for ${requirement}`} // Accessibility
                                        >
                                            <MoreHoriz /> {/* Use the iconoir MoreHoriz icon */}
                                        </button>
                                    </div>

                                    {/* Menu Popover (positioned absolutely) */}
                                    {activeMenuRequirement === requirement && (
                                        // Assign ref for click-outside detection
                                        <div className="requirement-menu-popover" ref={menuRef}>
                                            {/* Use consistent menu item styling */}
                                            <button className="menu-item" onClick={() => { isFulfilled ? markAsUnfulfilled(requirement) : markAsFulfilled(requirement); }}>
                                                {isFulfilled ? 'Mark as Unfulfilled' : 'Mark as Fulfilled'}
                                            </button>
                                            {/* Removed explicit Close button, click outside or action click closes */}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        // Show message if expanded but requirements array is empty or null/undefined
                        <p className="no-requirements-message">No requirements listed for this category.</p>
                    )}
                </div>
            )}
             {/* REMOVED: The redundant check {!requirements && <p>No requirements listed.</p>} outside the expanded check */}
        </div>
    );
}