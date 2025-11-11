import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client/react";
import classNames from "classnames";
import {
  ArrowDown,
  ArrowUp,
  Filter,
  Minus,
  NavArrowDown,
  Plus,
  Sort,
} from "iconoir-react";
import { useNavigate } from "react-router-dom";

import {
  Badge,
  Boundary,
  Box,
  Button,
  Checkbox,
  Color,
  DropdownMenu,
  Flex,
  IconButton,
  LoadingIndicator,
  Text,
  Tooltip,
} from "@repo/theme";

import { initialize } from "@/components/CourseSearch/browser";
import {
  useCreateNewPlanTerm,
  useEditPlan,
  useEditPlanTerm,
  useReadPlan,
  useReadUser,
} from "@/hooks/api";
import {
  Colleges,
  GET_COURSE_NAMES,
  GetCoursesResponse,
  ILabel,
  IPlanTerm,
  ISelectedCourse,
  PlanInput,
  PlanTermInput,
  Status,
} from "@/lib/api";
import { convertStringsToRequirementEnum } from "@/lib/course";

import AddBlockMenu from "./AddBlockMenu";
import styles from "./Dashboard.module.scss";
import DisplayMenu from "./DisplayMenu";
import LabelMenu from "./LabelMenu";
import SemesterBlock from "./SemesterBlock";
import SidePanel from "./SidePanel";
import { useGradTrakSettings } from "./settings";
import { GetCourseNamesDocument } from "@/lib/generated/graphql";

const FILTER_OPTIONS = [
  {
    label: "Completed",
    value: "completed",
  },

  {
    label: "In Progress",
    value: "inProgress",
  },
  {
    label: "Incomplete",
    value: "incomplete",
  },
];

const SORT_OPTIONS = ["Course", "Semester"];
const SORT_OPTIONS_SEMESTER = ["Oldest", "Newest"];
const SORT_OPTIONS_COURSE = ["Unsorted", "A-Z", "Z-A"];

const SORT_OPTION_SEMESTER_ICON = {
  Oldest: <ArrowUp className={styles.menuIcon} />,
  Newest: <ArrowDown className={styles.menuIcon} />,
};
const SORT_OPTION_COURSE_ICON = {
  Unsorted: <Minus className={styles.menuIcon} />,
  "A-Z": <ArrowUp className={styles.menuIcon} />,
  "Z-A": <ArrowDown className={styles.menuIcon} />,
};

export interface SelectedCourse extends ISelectedCourse {
  courseSubject: string;
  courseNumber: string;
}

export default function Dashboard() {
  const { data: user, loading: userLoading } = useReadUser();
  const navigate = useNavigate();

  const { data: gradTrak, loading: gradTrakLoading } = useReadPlan({
    skip: !user,
    fetchPolicy: "cache-and-network",
  });

  if (!gradTrakLoading && !gradTrak) {
    navigate("/gradtrak");
  }

  const hasLoadedRef = useRef(false);
  const { data: courses, loading: courseLoading } =
    useQuery(GetCourseNamesDocument, {
      skip: hasLoadedRef.current,
    });

  useEffect(() => {
    if (courses && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
    }
  }, [courses]);
  const catalogCoursesRef = useRef<SelectedCourse[]>([]);
  const indexRef = useRef<ReturnType<typeof initialize> | null>(null);

  if (courses?.courses && catalogCoursesRef.current.length === 0) {
    const formattedClasses = courses.courses.map((course) => ({
      courseID: `${course.subject}_${course.number}`,
      courseName: `${course.subject} ${course.number}`,
      courseTitle: course.title,
      courseUnits: -1,
      uniReqs: [], // TODO(Daniel): Fetch reqs
      collegeReqs: [], // TODO(Daniel): Fetch reqs
      pnp: false,
      transfer: false,
      labels: [],
      courseSubject: course.subject,
      courseNumber: course.number,
    }));
    catalogCoursesRef.current = formattedClasses;
    indexRef.current = initialize(courses.courses);
  }
  const catalogCourses = catalogCoursesRef.current;
  const index = indexRef.current;

  const [showDisplayMenu, setShowDisplayMenu] = useState(false);
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [settings, updateSettings] = useGradTrakSettings();
  const [localLabels, setLocalLabels] = useState<ILabel[]>([]);
  const [localPlanTerms, setLocalPlanTerms] = useState<IPlanTerm[]>([]);
  const displayMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [colleges, setColleges] = useState<Colleges[]>([]);

  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    completed: boolean;
    inProgress: boolean;
    incomplete: boolean;
    [key: string]: boolean;
  }>({
    completed: false,
    inProgress: false,
    incomplete: false,
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortPage, setSortPage] =
    useState<(typeof SORT_OPTIONS)[number]>("Semester");
  const [sortSemesterOption, setSortSemesterOption] =
    useState<(typeof SORT_OPTIONS_SEMESTER)[number]>("Oldest");
  const [sortCourseOption, setSortCourseOption] =
    useState<(typeof SORT_OPTIONS_COURSE)[number]>("Unsorted");

  const [editPlan] = useEditPlan();
  const [editPlanTerm] = useEditPlanTerm();

  const selectedDegreeStrings = useMemo(() => {
    return gradTrak?.majors || [];
  }, [gradTrak?.majors]);

  const selectedMinorStrings = useMemo(() => {
    return gradTrak?.minors || [];
  }, [gradTrak?.minors]);

  useEffect(() => {
    if (gradTrak?.colleges) {
      setColleges(gradTrak.colleges.map((college) => college as Colleges));
    }
  }, [gradTrak?.colleges]);

  useEffect(() => {
    if (gradTrak?.labels) {
      setLocalLabels(gradTrak.labels);
    }
  }, [gradTrak?.labels]);

  useEffect(() => {
    if (gradTrak?.planTerms) {
      setLocalPlanTerms(gradTrak.planTerms);
    } else {
      setLocalPlanTerms([]);
    }
  }, [gradTrak?.planTerms]);

  // Update filter options when labels change
  useEffect(() => {
    setFilterOptions((prev) => {
      const newOptions = { ...prev };

      // Add new label filters
      localLabels.forEach((label) => {
        const labelKey = `label_${label.name}`;
        if (!(labelKey in newOptions)) {
          newOptions[labelKey] = false;
        }
      });

      // Remove label filters that no longer exist
      Object.keys(newOptions).forEach((key) => {
        if (key.startsWith("label_")) {
          const labelName = key.replace("label_", "");
          if (!localLabels.some((label) => label.name === labelName)) {
            delete newOptions[key];
          }
        }
      });

      return newOptions;
    });
  }, [localLabels]);

  // helper functions for adding new block in right order
  const getTermOrder = (term: string) => {
    switch (term) {
      case "Spring":
        return 1;
      case "Summer":
        return 2;
      case "Fall":
        return 3;
      default:
        return 0;
    }
  };
  const insertPlanTerm = (planTerms: IPlanTerm[], newTerm: IPlanTerm) => {
    const newArray = [...planTerms, newTerm];
    setLocalPlanTerms(newArray);
  };

  const [createNewPlanTerm] = useCreateNewPlanTerm();
  const handleNewPlanTerm = async (planTerm: PlanTermInput) => {
    const tmp: IPlanTerm = {
      _id: "",
      userEmail: gradTrak ? gradTrak.userEmail : "",
      name: planTerm.name,
      year: planTerm.year,
      term: planTerm.term,
      hidden: planTerm.hidden,
      status: planTerm.status,
      pinned: planTerm.pinned,
      courses: [],
    };
    const oldPlanTerms = [...localPlanTerms];
    insertPlanTerm(oldPlanTerms, tmp);
    try {
      const result = await createNewPlanTerm(planTerm);
      if (result.data?.createNewPlanTerm?._id) {
        tmp._id = result.data?.createNewPlanTerm?._id;
      } else {
        throw new Error("Cannot find id");
      }
    } catch (error) {
      console.error("Error creating new plan term:", error);
      setLocalPlanTerms(oldPlanTerms);
    }
  };

  // Helper functions to update both local state and backend
  const handleUpdateTermName = async (termId: string, name: string) => {
    let updatedPlanTerms = [...localPlanTerms];
    const termIndex = localPlanTerms.findIndex((term) => term._id === termId);
    if (termIndex !== -1) {
      const updatedTerm = {
        ...updatedPlanTerms[termIndex],
        name: name,
      };
      updatedPlanTerms[termIndex] = updatedTerm;
      setLocalPlanTerms(updatedPlanTerms);

      try {
        await editPlanTerm(termId, { name });
      } catch (error) {
        console.error("Error updating term name:", error);
        // Revert local state on error
        setLocalPlanTerms(localPlanTerms);
      }
    }
  };

  const handleTogglePin = async (termId: string) => {
    const updatedPlanTerms = [...localPlanTerms];
    const termIndex = updatedPlanTerms.findIndex((term) => term._id === termId);
    if (termIndex !== -1) {
      const newPinned = !updatedPlanTerms[termIndex].pinned;
      updatedPlanTerms[termIndex].pinned = newPinned;
      setLocalPlanTerms(updatedPlanTerms);

      try {
        await editPlanTerm(termId, { pinned: newPinned });
      } catch (error) {
        console.error("Error toggling pin:", error);
        // Revert local state on error
        setLocalPlanTerms(localPlanTerms);
      }
    }
  };

  const handleSetStatus = async (termId: string, status: Status) => {
    const updatedPlanTerms = localPlanTerms.map((term) =>
      term._id === termId ? { ...term, status } : term
    );
    setLocalPlanTerms(updatedPlanTerms);

    try {
      await editPlanTerm(termId, { status });
    } catch (error) {
      console.error("Error setting status:", error);
      // Revert local state on error
      setLocalPlanTerms(localPlanTerms);
    }
  };

  const updateLabels = (labels: ILabel[]) => {
    setLocalLabels(labels);
    const plan: PlanInput = {};
    plan.labels = labels;
    editPlan(plan);
  };

  const handleFilterOptionChange = (option: keyof typeof filterOptions) => {
    setFilterOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const handleChangeSortPage = (page: (typeof SORT_OPTIONS)[number]) => {
    setSortPage(page);
  };

  const handleSortSemesterOptionChange = (
    option: (typeof SORT_OPTIONS_SEMESTER)[number]
  ) => {
    setSortSemesterOption(option);
    setSortMenuOpen(false);
  };

  const handleSortCourseOptionChange = (
    option: (typeof SORT_OPTIONS_COURSE)[number]
  ) => {
    setSortCourseOption(option);
    setSortMenuOpen(false);
  };

  const currentUserInfo = useMemo(
    (): { name: string; majors: string[]; minors: string[] } | null => {
      if (!user) {
        console.error(
          "User data unexpectedly null in currentUserInfo memo after loading check."
        );
        return null;
      }
      return {
        name: user.name, // Use the actual user's username
        majors: selectedDegreeStrings, // Use the majors from state
        minors: selectedMinorStrings, // Use the minors from state
      };
    },
    [user, selectedDegreeStrings, selectedMinorStrings] // Re-calculate if user or selected lists change
  );

  // State for semester totals and classes
  const [semesterTotals, setSemesterTotals] = useState<Record<string, number>>(
    {}
  );
  const [semesterPnpTotals, setSemesterPnpTotals] = useState<
    Record<string, number>
  >({});
  const [semesterTransferTotals, setSemesterTransferTotals] = useState<
    Record<string, number>
  >({});

  // Create the allSemesters state to track classes in each semester
  const [allSemesters, setAllSemesters] = useState<{
    [key: string]: ISelectedCourse[];
  }>({});
  const [filteredAllSemesters, setFilteredAllSemesters] = useState<{
    [key: string]: ISelectedCourse[];
  }>({});

  const filterSemesters = (allSemesters: {
    [key: string]: ISelectedCourse[];
  }) => {
    // if none of the label filters are selected, return all semesters
    const hasActiveLabelFilters = Object.keys(filterOptions).some(
      (key) => key.startsWith("label_") && filterOptions[key]
    );

    if (!hasActiveLabelFilters) {
      setFilteredAllSemesters(allSemesters);
      return;
    }

    // iterate through each semester
    const filteredSemesters: { [key: string]: ISelectedCourse[] } = {};
    Object.entries(allSemesters).forEach(([key, value]) => {
      const filteredClasses = value.filter((course) => {
        for (const label of course.labels) {
          if (filterOptions["label_" + label.name]) {
            return true;
          }
        }
        return false;
      });
      filteredSemesters[key] = filteredClasses;
    });
    setFilteredAllSemesters(filteredSemesters);
  };

  useEffect(() => {
    setActiveFiltersCount(Object.values(filterOptions).filter(Boolean).length);
    filterSemesters(allSemesters);
  }, [filterOptions]);

  // Calculate label counts when dropdown is opened
  const calculateLabelCounts = () => {
    const counts: Record<string, number> = {};

    localLabels.forEach((label) => {
      counts[label.name] = 0;
    });

    Object.values(allSemesters).forEach((courses) => {
      courses.forEach((course) => {
        if (course.labels) {
          course.labels.forEach((courseLabel) => {
            if (counts[courseLabel.name] !== undefined) {
              counts[courseLabel.name]++;
            }
          });
        }
      });
    });

    return counts;
  };

  // Calculate status counts when dropdown is opened
  const calculateStatusCounts = () => {
    const counts = {
      completed: 0,
      inProgress: 0,
      incomplete: 0,
    };

    localPlanTerms.forEach((planTerm) => {
      if (planTerm.status === "Complete") {
        counts.completed++;
      } else if (planTerm.status === "InProgress") {
        counts.inProgress++;
      } else if (planTerm.status === "Incomplete") {
        counts.incomplete++;
      }
    });

    return counts;
  };

  const updateTotalUnits = useCallback(
    (
      semesterKey: string,
      newTotal: number,
      pnpUnits: number,
      transferUnits: number
    ) => {
      setSemesterTotals((prev) => ({ ...prev, [semesterKey]: newTotal }));
      setSemesterPnpTotals((prev) => ({ ...prev, [semesterKey]: pnpUnits }));
      setSemesterTransferTotals((prev) => ({
        ...prev,
        [semesterKey]: transferUnits,
      }));
    },
    []
  );

  const convertPlanTermsToSemesters = useCallback(
    (planTerms: IPlanTerm[]): { [key: string]: ISelectedCourse[] } => {
      const semesters: { [key: string]: ISelectedCourse[] } = {};

      planTerms.forEach((planTerm) => {
        // Create semester key based on term and year
        const semesterKey = planTerm._id;

        const classes: ISelectedCourse[] = [];

        planTerm.courses.forEach((course: ISelectedCourse) => {
          // Remove __typename from course object
          const cleanCourse = {
            courseID: course.courseID,
            courseName: course.courseName,
            courseTitle: course.courseTitle,
            courseUnits: course.courseUnits,
            uniReqs: course.uniReqs,
            collegeReqs: course.collegeReqs,
            pnp: course.pnp,
            transfer: course.transfer,
            labels:
              course.labels?.map((label) => ({
                name: label.name,
                color: label.color,
              })) || [],
          };
          classes.push(cleanCourse);
        });

        if (semesterKey) {
          semesters[semesterKey] = classes;
        }
      });
      return semesters;
    },
    []
  );

  // Function to update all semesters data
  const updateAllSemesters = (semesters: {
    [key: string]: ISelectedCourse[];
  }) => {
    filterSemesters(semesters);
    setAllSemesters(semesters);
  };

  useEffect(() => {
    if (localPlanTerms && localPlanTerms.length > 0) {
      const convertedSemesters = convertPlanTermsToSemesters(localPlanTerms);
      setAllSemesters(convertedSemesters);
    }
  }, [localPlanTerms, convertPlanTermsToSemesters]);

  const totalUnits = Object.values(semesterTotals).reduce(
    (sum, units) => sum + units,
    0
  );

  // Calculate P/NP total units by summing semester blocks
  const pnpTotal = Object.values(semesterPnpTotals).reduce(
    (sum, units) => sum + units,
    0
  );
  const transferUnits = Object.values(semesterTransferTotals).reduce(
    (sum, units) => sum + units,
    0
  );

  useEffect(() => {
    if (!currentUserInfo && !userLoading && !gradTrakLoading) {
      navigate("/gradtrak", { replace: true });
    }
  }, [currentUserInfo, userLoading, gradTrakLoading, navigate]);

  if (userLoading || gradTrakLoading || courseLoading) {
    return (
      <Boundary>
        <LoadingIndicator size="lg" />
      </Boundary>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <SidePanel
          colleges={colleges}
          majors={currentUserInfo ? currentUserInfo.majors : []}
          minors={currentUserInfo ? currentUserInfo.minors : []}
          totalUnits={totalUnits}
          transferUnits={transferUnits}
          pnpTotal={pnpTotal}
          uniReqsFulfilled={convertStringsToRequirementEnum(
            gradTrak?.uniReqsSatisfied ? gradTrak?.uniReqsSatisfied : []
          )}
          collegeReqsFulfilled={convertStringsToRequirementEnum(
            gradTrak?.collegeReqsSatisfied ? gradTrak?.collegeReqsSatisfied : []
          )}
        />
      </div>

      <div className={styles.view}>
        <div className={styles.header}>
          <h1>Semesters</h1>

          <div className={styles.buttonsGroup}>
            <DropdownMenu.Root
              open={filterMenuOpen}
              onOpenChange={setFilterMenuOpen}
            >
              <DropdownMenu.Trigger asChild>
                <Tooltip content="Filter">
                  <div className={styles.filterButtonContainer}>
                    <IconButton
                      className={styles.filterButton}
                      data-open={filterMenuOpen}
                    >
                      <Filter />
                    </IconButton>
                    {activeFiltersCount > 0 && (
                      <div className={styles.filterButtonBadge}>
                        {activeFiltersCount}
                      </div>
                    )}
                  </div>
                </Tooltip>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                sideOffset={5}
                align="end"
                className={styles.filtersDropdown}
              >
                <Box>
                  <Flex direction="column" gap="8px">
                    <Text
                      className={styles.sectionTitle}
                      style={{ marginTop: "8px" }}
                    >
                      Status
                    </Text>
                    {(() => {
                      const statusCounts = calculateStatusCounts();
                      return (
                        <>
                          {FILTER_OPTIONS.map((option) => (
                            <Flex
                              key={option.value}
                              align="center"
                              gap="8px"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                handleFilterOptionChange(option.value)
                              }
                            >
                              <Checkbox
                                checked={filterOptions[option.value]}
                                style={{ cursor: "pointer" }}
                              />
                              <Text
                                className={styles.filterOptionText}
                                data-selected={filterOptions[option.value]}
                              >
                                {option.label}
                              </Text>
                              <Text className={styles.labelCount}>
                                (
                                {
                                  statusCounts[
                                    option.value as keyof typeof statusCounts
                                  ]
                                }
                                )
                              </Text>
                            </Flex>
                          ))}
                        </>
                      );
                    })()}

                    {localLabels.length > 0 && (
                      <>
                        <Text className={styles.sectionTitle}>
                          Custom Labels
                        </Text>
                        {localLabels.map((label) => {
                          const labelKey = `label_${label.name}`;
                          const labelCounts = calculateLabelCounts();
                          return (
                            <Flex
                              key={labelKey}
                              align="center"
                              gap="8px"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleFilterOptionChange(labelKey)}
                            >
                              <Checkbox
                                checked={filterOptions[labelKey] || false}
                                style={{ cursor: "pointer" }}
                              />
                              <Badge
                                label={label.name}
                                color={label.color as Color}
                              />
                              <Text className={styles.labelCount}>
                                ({labelCounts[label.name] || 0})
                              </Text>
                            </Flex>
                          );
                        })}
                      </>
                    )}
                  </Flex>
                </Box>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <div className={styles.dropdown}>
              <DropdownMenu.Root
                open={sortMenuOpen}
                onOpenChange={setSortMenuOpen}
              >
                <DropdownMenu.Trigger asChild>
                  <Tooltip content="Sort">
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <IconButton
                        style={{
                          backgroundColor: sortMenuOpen ? "#52525B" : undefined,
                        }}
                      >
                        <Sort />
                      </IconButton>
                    </div>
                  </Tooltip>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  sideOffset={5}
                  align="end"
                  style={{
                    width: "max-content",
                    paddingTop: "0px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <Text
                    className={styles.sectionTitle}
                    style={{ marginTop: "8px" }}
                  >
                    Sort By
                  </Text>
                  {SORT_OPTIONS.map((option) => (
                    <div
                      key={option}
                      className={styles.sortMenu}
                      onClick={() => {
                        handleChangeSortPage(option);
                      }}
                    >
                      <div style={{ paddingTop: "3px" }} />
                      <label className={styles.option}>
                        <input
                          type="radio"
                          name="sortType"
                          checked={sortPage === option}
                          onChange={() => handleChangeSortPage(option)}
                          className={styles.input}
                        />
                        <div
                          className={styles.circle}
                          style={{
                            borderColor:
                              sortPage === option
                                ? "var(--blue-500)"
                                : "#C7C7C7",
                          }}
                        >
                          {sortPage === option && (
                            <div className={styles.dot}></div>
                          )}
                        </div>
                        <Text
                          style={{
                            color:
                              sortPage === option
                                ? "var(--heading-color)"
                                : "var(--paragraph-color)",
                            marginLeft: "-6px",
                          }}
                        >
                          {option}
                        </Text>
                      </label>
                    </div>
                  ))}

                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "var(--border-color)",
                      margin: "5px 0px",
                      width: "100%",
                    }}
                  />

                  <div>
                    {sortPage === "Semester" &&
                      SORT_OPTIONS_SEMESTER.map((option) => (
                        <DropdownMenu.Item
                          key={option}
                          onClick={() => handleSortSemesterOptionChange(option)}
                          className={classNames(styles.menuItem, {
                            [styles.selected]: sortSemesterOption === option,
                          })}
                        >
                          {
                            SORT_OPTION_SEMESTER_ICON[
                              option as keyof typeof SORT_OPTION_SEMESTER_ICON
                            ]
                          }
                          <Text className={styles.menuText}>
                            {option} First
                          </Text>
                        </DropdownMenu.Item>
                      ))}
                    {sortPage === "Course" &&
                      SORT_OPTIONS_COURSE.map((option) => (
                        <DropdownMenu.Item
                          key={option}
                          onClick={() => handleSortCourseOptionChange(option)}
                          className={classNames(styles.menuItem, {
                            [styles.selected]: sortCourseOption === option,
                          })}
                        >
                          {
                            SORT_OPTION_COURSE_ICON[
                              option as keyof typeof SORT_OPTION_COURSE_ICON
                            ]
                          }
                          <Text className={styles.menuText}>{option}</Text>
                        </DropdownMenu.Item>
                      ))}
                  </div>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>

            <Tooltip content="Add new block">
              <IconButton
                onClick={() => {
                  setShowAddBlockMenu(!showAddBlockMenu);
                }}
              >
                <Plus />
              </IconButton>
            </Tooltip>

            <Tooltip content="Display settings">
              <Button
                ref={displayMenuTriggerRef}
                variant="secondary"
                onClick={() => {
                  setShowDisplayMenu(!showDisplayMenu);
                }}
              >
                Display
                <NavArrowDown />
              </Button>
            </Tooltip>
          </div>
        </div>
        {showDisplayMenu && (
          <DisplayMenu
            onClose={() => setShowDisplayMenu(false)}
            settings={settings}
            onChangeSettings={(patch) => updateSettings(patch)}
            triggerRef={displayMenuTriggerRef}
            labels={localLabels}
            setShowLabelMenu={setShowLabelMenu}
          />
        )}
        <LabelMenu
          open={showLabelMenu}
          onOpenChange={setShowLabelMenu}
          labels={localLabels}
          onLabelsChange={updateLabels}
        />
        {showAddBlockMenu && (
          <AddBlockMenu
            onClose={() => setShowAddBlockMenu(false)}
            createNewPlanTerm={handleNewPlanTerm}
          />
        )}
        <div className={styles.semesterBlocks}>
          <div className={styles.semesterLayout} data-layout={settings.layout}>
            {localPlanTerms &&
              [...localPlanTerms]
                .filter((term) => {
                  if (
                    !(
                      filterOptions.completed ||
                      filterOptions.inProgress ||
                      filterOptions.incomplete
                    )
                  )
                    return true;

                  if (filterOptions.completed && term.status === "Complete")
                    return true;
                  if (filterOptions.inProgress && term.status === "InProgress")
                    return true;
                  if (filterOptions.incomplete && term.status === "Incomplete")
                    return true;

                  return false;
                })
                .filter((term) => {
                  if (
                    !Object.keys(filterOptions).some(
                      (key) => key.startsWith("label_") && filterOptions[key]
                    )
                  ) {
                    return true;
                  }
                  return filteredAllSemesters[term._id]
                    ? filteredAllSemesters[term._id].length > 0
                    : false;
                })
                .sort((a, b) => {
                  // Pinned terms first
                  if (a.pinned && !b.pinned) return -1;
                  if (!a.pinned && b.pinned) return 1;

                  // misc always comes first
                  if (a.year == -1 || b.year == -1) {
                    return a.year - b.year;
                  }
                  if (sortSemesterOption === "Oldest") {
                    if (a.year != b.year) return a.year - b.year;
                    return getTermOrder(a.term) - getTermOrder(b.term);
                  } else {
                    if (a.year != b.year) return b.year - a.year;
                    return getTermOrder(b.term) - getTermOrder(a.term);
                  }
                })
                .map((term) => (
                  <SemesterBlock
                    key={term._id}
                    planTerm={term}
                    onTotalUnitsChange={(newTotal, pnpUnits, transferUnits) =>
                      updateTotalUnits(
                        term.name ? term.name : "",
                        newTotal,
                        pnpUnits,
                        transferUnits
                      )
                    }
                    filteredSemesters={filteredAllSemesters}
                    allSemesters={allSemesters}
                    updateAllSemesters={updateAllSemesters}
                    settings={settings}
                    labels={localLabels}
                    setShowLabelMenu={setShowLabelMenu}
                    catalogCourses={catalogCourses}
                    index={index}
                    handleUpdateTermName={(name) =>
                      handleUpdateTermName(term._id, name)
                    }
                    handleTogglePin={() => handleTogglePin(term._id)}
                    handleSetStatus={(status: Status) =>
                      handleSetStatus(term._id, status)
                    }
                    sortCourseOption={sortCourseOption}
                    handleRemoveTerm={() => {
                      const updatedPlanTerms = localPlanTerms.filter(
                        (t) => t._id !== term._id
                      );
                      setLocalPlanTerms(updatedPlanTerms);
                    }}
                    filtersActive={activeFiltersCount > 0}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
