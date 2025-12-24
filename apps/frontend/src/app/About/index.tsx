import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client/react";
import { LightBulb, NavArrowLeft, NavArrowRight } from "iconoir-react";

import { Select } from "@repo/theme";

import { GetAllStaffMembersDocument } from "@/lib/generated/graphql";

import styles from "./About.module.scss";
import { MemberCard } from "./MemberCard";

const ABOUT_IMAGES = [
  "/images/about1.png",
  "/images/about2.png",
  "/images/about3.png",
  "/images/about4.png",
  "/images/about5.png",
];

// Founding Team data
const FOUNDING_TEAM = [
  {
    name: "Christine Wang",
    role: "Fullstack Engineer",
    link: "https://www.linkedin.com/in/cwang395/",
  },
  { name: "Emily Chen", role: "Fullstack Engineer", link: null },
  {
    name: "Eric Huynh",
    role: "Fullstack Engineer",
    link: "http://erichuynhing.com/",
  },
  { name: "Jennifer Yu", role: "Fullstack Engineer", link: null },
  { name: "Justin Lu", role: "Fullstack Engineer", link: null },
  {
    name: "Kelvin Leong",
    role: "Fullstack Engineer",
    link: "https://www.linkedin.com/in/kelvinjleong/",
  },
  {
    name: "Kevin Jiang",
    role: "Fullstack Engineer",
    link: "https://github.com/kevjiangba/",
  },
  { name: "Kimya Khoshnan", role: "Fullstack Engineer", link: null },
  { name: "Laura Harker", role: "Fullstack Engineer", link: null },
  { name: "Mihir Patil", role: "Fullstack Engineer", link: null },
  { name: "Niraj Amalkanti", role: "Fullstack Engineer", link: null },
  { name: "Parsa Attari", role: "Fullstack Engineer", link: null },
  { name: "Ronald Lee", role: "Fullstack Engineer", link: null },
  { name: "Sanchit Bareja", role: "Fullstack Engineer", link: null },
  { name: "Sandy Zhang", role: "Fullstack Engineer", link: null },
];

// Founders data
const FOUNDERS = [
  {
    name: "Ashwin Iyengar",
    role: "Co-Founder",
    link: "http://ashwiniyengar.github.io/",
  },
  {
    name: "Noah Gilmore",
    role: "Co-Founder",
    link: "https://noahgilmore.com/",
  },
  { name: "Yuxin Zhu", role: "Co-Founder", link: "http://yuxinzhu.com/" },
];

// Alumni data
type AlumniMember = {
  name: string;
  role: string;
  link: string | null;
};

type AlumniGroup = {
  year: number;
  members: AlumniMember[];
};

const LEGACY_ALUMNI: AlumniGroup[] = [
  {
    year: 2024,
    members: [
      { name: "Alex Zhang", role: "Backend Engineer", link: null },
      { name: "Gabe Mitnick", role: "Frontend Engineer", link: null },
      { name: "Kelly Ma", role: "Design Lead", link: null },
      { name: "Kevin Wang", role: "Product Manager", link: null },
      { name: "Nikhil Jha", role: "Backend Engineer", link: null },
      { name: "Nikhil Ograin", role: "Backend Engineer", link: null },
      { name: "Rachel Hua", role: "Designer", link: null },
      { name: "Shuming Xu", role: "Backend Engineer", link: null },
      { name: "Vihan Bhargava", role: "Frontend Engineer", link: null },
    ],
  },
  {
    year: 2023,
    members: [
      { name: "Alex Xi", role: "Backend Lead", link: null },
      { name: "Annie Pan", role: "Designer", link: null },
      { name: "Carissa Cui", role: "Designer", link: null },
      { name: "Cici Wei", role: "Designer", link: null },
      { name: "Joanne Chuang", role: "Designer", link: null },
      { name: "Yueheng Zhang", role: "Backend Engineer", link: null },
      { name: "Zachary Zollman", role: "Backend Lead", link: null },
    ],
  },
  {
    year: 2022,
    members: [
      { name: "Christina Shao", role: "Frontend Lead", link: null },
      { name: "Danji Liu", role: "Design Lead", link: null },
      { name: "Hiroshi Usui", role: "Backend Lead", link: null },
    ],
  },
  {
    year: 2021,
    members: [
      { name: "Christopher Liu", role: "Frontend Lead", link: null },
      { name: "Grace Luo", role: "Product Manager", link: null },
      { name: "Hannah Yan", role: "Designer", link: null },
      { name: "Janet Xu", role: "Design Lead", link: null },
      { name: "Jonathan Pan", role: "Backend Engineer", link: null },
      { name: "Junghyun Choy", role: "Designer", link: null },
      { name: "Leon Ming", role: "Backend Lead", link: null },
    ],
  },
  {
    year: 2020,
    members: [
      { name: "Anson Tsai", role: "Backend Engineer", link: null },
      { name: "Chloe Liu", role: "Frontend Engineer", link: null },
      { name: "Eli Wu", role: "Backend Engineer", link: null },
      { name: "Isabella Lau", role: "Backend Engineer", link: null },
      { name: "Jemma Kwak", role: "Design Lead", link: null },
      { name: "Sean Meng", role: "Backend Engineer", link: null },
      { name: "Will Wang", role: "Backend Lead / PM", link: null },
    ],
  },
  {
    year: 2019,
    members: [
      { name: "Evelyn Li", role: "Backend Engineer", link: null },
      { name: "Kate Xu", role: "Frontend Lead", link: null },
      { name: "Mary Liu", role: "Backend Engineer", link: null },
      { name: "Richard Liu", role: "Backend Engineer", link: null },
      { name: "Sangbin Cho", role: "Backend Lead", link: null },
      { name: "Scott Lee", role: "Frontend Lead / PM", link: null },
    ],
  },
];

export default function About() {
  const { data: allStaffMembers, loading: allStaffMembersLoading } = useQuery(
    GetAllStaffMembersDocument
  );

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedAlumniYear, setSelectedAlumniYear] = useState<number | null>(
    null
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitioningFromIndex, setTransitioningFromIndex] = useState<
    number | null
  >(null);
  const autoRotateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const latestTerm = useMemo(() => {
    const semesterOrder: Record<string, number> = {
      Spring: 0,
      Fall: 1,
    };

    let latestYear = 0;
    let latestSemester: "Spring" | "Fall" = "Spring";

    allStaffMembers?.allStaffMembers?.forEach((member) => {
      member.roles.forEach((role) => {
        if (role.year > latestYear) {
          latestYear = role.year;
          latestSemester = role.semester as "Spring" | "Fall";
        } else if (role.year === latestYear) {
          const currentOrder = semesterOrder[latestSemester] ?? 0;
          const roleOrder =
            semesterOrder[role.semester as "Spring" | "Fall"] ?? 0;
          if (roleOrder > currentOrder) {
            latestSemester = role.semester as "Spring" | "Fall";
          }
        }
      });
    });

    return { year: latestYear, semester: latestSemester };
  }, [allStaffMembers, allStaffMembersLoading]);

  const [selectedTerm, setSelectedTerm] = useState<{
    year: number;
    semester: "Spring" | "Fall";
  } | null>(latestTerm);

  const availableTerms = useMemo(() => {
    const terms: { year: number; semester: "Spring" | "Fall" }[] = [];
    allStaffMembers?.allStaffMembers?.forEach((member) => {
      member.roles.forEach((role) => {
        if (
          terms.some(
            (t) => t.year === role.year && t.semester === role.semester
          )
        )
          return;
        terms.push({
          year: role.year,
          semester: role.semester as "Spring" | "Fall",
        });
      });
    });
    const sorted = Array.from(terms).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year; // Sort by year descending
      // If same year, Spring comes before Fall
      return a.semester === "Spring" ? 1 : -1;
    });
    setSelectedTerm(sorted[0]);
    return sorted;
  }, [allStaffMembers, allStaffMembersLoading]);

  // Convert availableTerms to Select options
  const termOptions = useMemo(() => {
    return availableTerms.map((term) => ({
      value: term,
      label: `${term.semester} ${term.year}`,
    }));
  }, [availableTerms]);

  const availableAlumniYears = useMemo(() => {
    const years = new Set<number>();
    allStaffMembers?.allStaffMembers?.forEach((member) => {
      if (
        member.roles.some(
          (role) =>
            role.year === latestTerm.year &&
            role.semester === latestTerm.semester
        ) ||
        member.roles.length == 0
      )
        return;
      const latestRole = member.roles.sort((a, b) => b.year - a.year)[0];
      years.add(latestRole.year);
    });
    // Add years from constant LEGACY_ALUMNI
    LEGACY_ALUMNI.forEach((alumniGroup) => {
      years.add(alumniGroup.year);
    });
    const sorted = Array.from(years).sort((a, b) => b - a);
    setSelectedAlumniYear(sorted[0]);
    return sorted;
  }, [allStaffMembers, allStaffMembersLoading]);

  const availableTeams = useMemo(() => {
    const teams = new Set<string>();
    allStaffMembers?.allStaffMembers?.forEach((member) => {
      member.roles.forEach((role) => {
        if (
          role.year === selectedTerm?.year &&
          role.semester === selectedTerm?.semester &&
          role.team
        ) {
          teams.add(role.team);
        }
      });
    });
    return Array.from(teams).sort();
  }, [allStaffMembers, allStaffMembersLoading, selectedTerm]);

  // Filter by team or leadership
  const filteredTeamMembers = useMemo(() => {
    let filtered = allStaffMembers?.allStaffMembers?.filter((member) =>
      member.roles.some(
        (role) =>
          role.year === selectedTerm?.year &&
          role.semester === selectedTerm?.semester
      )
    );

    if (selectedTeam === "Leadership") {
      filtered = filtered?.filter((member) =>
        member.roles.some(
          (role) =>
            role.year === selectedTerm?.year &&
            role.semester === selectedTerm?.semester &&
            role.isLeadership
        )
      );
    } else if (selectedTeam) {
      filtered = filtered?.filter((member) =>
        member.roles.some(
          (role) =>
            role.year === selectedTerm?.year &&
            role.semester === selectedTerm?.semester &&
            role.team === selectedTeam
        )
      );
    }

    // Sort: leadership first, then alphabetically by name
    return filtered?.sort((a, b) => {
      const aHasLeadership = a.roles.some(
        (r) =>
          r.year === selectedTerm?.year &&
          r.semester === selectedTerm?.semester &&
          r.isLeadership
      );
      const bHasLeadership = b.roles.some(
        (r) =>
          r.year === selectedTerm?.year &&
          r.semester === selectedTerm?.semester &&
          r.isLeadership
      );

      if (aHasLeadership && !bHasLeadership) return -1;
      if (!aHasLeadership && bHasLeadership) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [selectedTeam, allStaffMembers, allStaffMembersLoading, selectedTerm]);

  // Filter alumni by selected year
  // An alumnus is shown for a year if they have at least one role with isAlumni: true in that year
  const filteredAlumni = useMemo(() => {
    const graphqlAlumni =
      allStaffMembers?.allStaffMembers?.filter(
        (member) =>
          !member.roles.some(
            (role) =>
              role.year === latestTerm.year &&
              role.semester === latestTerm.semester
          ) && member.roles.some((role) => role.year === selectedAlumniYear)
      ) || [];

    // Get constant alumni for the selected year
    const constantAlumniGroup = LEGACY_ALUMNI.find(
      (group) => group.year === selectedAlumniYear
    );
    const constantAlumni = constantAlumniGroup
      ? constantAlumniGroup.members.map((member, index) => ({
          id: `alumni-${selectedAlumniYear}-${index}`,
          name: member.name,
          roles: [
            {
              year: selectedAlumniYear,
              semester: "Spring" as const,
              role: member.role,
              team: null,
              isLeadership: false,
              photo: null,
              altPhoto: null,
            },
          ],
          personalLink: member.link,
        }))
      : [];

    // Combine and sort: alphabetically by name
    return [...graphqlAlumni, ...constantAlumni].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [allStaffMembers, latestTerm, selectedAlumniYear]);

  // Function to start/reset auto-rotation timer
  const startAutoRotate = useCallback(() => {
    // Clear existing interval if any
    if (autoRotateIntervalRef.current) {
      clearInterval(autoRotateIntervalRef.current);
    }
    // Start new interval
    autoRotateIntervalRef.current = setInterval(() => {
      setSlideDirection("right");
      setCurrentImageIndex((prev) => {
        setTransitioningFromIndex(prev);
        setIsTransitioning(true);
        setTimeout(() => {
          setIsTransitioning(false);
          setTransitioningFromIndex(null);
        }, 600);
        return (prev + 1) % ABOUT_IMAGES.length;
      });
    }, 5000);
  }, []);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    startAutoRotate();
    return () => {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
      }
    };
  }, [startAutoRotate]);

  const goToPrevious = () => {
    setSlideDirection("left");
    setTransitioningFromIndex(currentImageIndex);
    setIsTransitioning(true);
    setCurrentImageIndex(
      (prev) => (prev - 1 + ABOUT_IMAGES.length) % ABOUT_IMAGES.length
    );
    startAutoRotate(); // Reset timer on manual navigation
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitioningFromIndex(null);
    }, 600); // Match transition duration
  };

  const goToNext = () => {
    setSlideDirection("right");
    setTransitioningFromIndex(currentImageIndex);
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => (prev + 1) % ABOUT_IMAGES.length);
    startAutoRotate(); // Reset timer on manual navigation
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitioningFromIndex(null);
    }, 600); // Match transition duration
  };

  // Calculate normalized offset for an image index
  // During transition, use the previous index to calculate positions
  const getNormalizedOffset = (imageIndex: number) => {
    const referenceIndex =
      isTransitioning && transitioningFromIndex !== null
        ? transitioningFromIndex
        : currentImageIndex;
    let offset = imageIndex - referenceIndex;
    // Normalize offset to handle wrapping
    if (offset > ABOUT_IMAGES.length / 2) {
      offset -= ABOUT_IMAGES.length;
    } else if (offset < -ABOUT_IMAGES.length / 2) {
      offset += ABOUT_IMAGES.length;
    }
    return offset;
  };

  // Calculate the position and transform for each image card
  const getImageTransform = (imageIndex: number) => {
    const offset = getNormalizedOffset(imageIndex);
    const isCurrent = offset === 0;
    const isPrev = offset === -1;
    const isNext = offset === 1;
    const isNextNext = offset === 2;
    const isPrevPrev = offset === -2;

    // Show more cards during transition to reveal the emerging card
    const isVisible = isTransitioning
      ? Math.abs(offset) <= 2 // Show up to 2 cards on each side during transition
      : Math.abs(offset) <= 1; // Normal: only show immediate neighbors

    // Card spacing
    const baseSpacing = 280;
    const farSpacing = 525; // Far enough to not overlap
    const nextSpacing = 50;

    let translateX = 0;
    let scale = 1;
    let zIndex = 1;

    if (isCurrent) {
      // Current card: move far left/right when transitioning
      if (isTransitioning) {
        if (slideDirection === "right") {
          translateX = -farSpacing; // Move far left
        } else {
          translateX = farSpacing; // Move far right
        }
        scale = 0.85;
        zIndex = 3; // Second highest z-index when going out
      } else {
        translateX = 0; // Center
        zIndex = 3; // Highest when in center
        scale = 1;
      }
    } else if (isNext) {
      // Next card: move to center when transitioning right, stay in place when transitioning left
      if (isTransitioning) {
        if (slideDirection === "right") {
          translateX = nextSpacing; // Move to center
          scale = 1;
          zIndex = 2; // Highest when becoming center
        } else {
          // When going left, next card should move closer but not all the way
          translateX = baseSpacing * 0.5; // Move closer
          scale = 0.7;
          zIndex = 0;
        }
      } else {
        translateX = baseSpacing; // Normal position on right
        scale = 0.85;
        zIndex = 2;
      }
    } else if (isPrev) {
      // Previous card: move to center when transitioning left, stay in place when transitioning right
      if (isTransitioning) {
        if (slideDirection === "left") {
          translateX = -nextSpacing; // Move to center
          scale = 1;
          zIndex = 2; // Highest when becoming center
        } else {
          // When going right, prev card should move closer but not all the way
          translateX = -baseSpacing * 0.2; // Move closer
          scale = 0.7;
          zIndex = 0;
        }
      } else {
        translateX = -baseSpacing; // Normal position on left
        scale = 0.85;
        zIndex = 2;
      }
    } else if (isNextNext) {
      // Card that will be on the right after transition (when going right)
      if (isTransitioning && slideDirection === "right") {
        translateX = baseSpacing; // Move to right side position
        scale = 0.85;
        zIndex = 1;
      } else {
        translateX = 0;
        scale = 0.85;
        zIndex = 1;
      }
    } else if (isPrevPrev) {
      // Card that will be on the left after transition (when going left)
      if (isTransitioning && slideDirection === "left") {
        translateX = -baseSpacing; // Move to left side position
        scale = 0.85;
        zIndex = 1;
      } else {
        translateX = 0;
        scale = 0.85;
        zIndex = 1;
      }
    } else {
      // Other cards: not visible
      translateX = 0;
      scale = 0.85;
      zIndex = 0;
    }

    return { translateX, scale, isVisible, offset, zIndex };
  };

  return (
    <div className={styles.root}>
      {/* About Our Team Section */}
      <div className={styles.aboutSection}>
        <h2 className={styles.aboutTitle}>About Our Team</h2>
        <p className={styles.aboutDescription}>
          We're a small group of student volunteers at UC Berkeley, dedicated to
          simplifying the course discovery experience. We actively build,
          improve and maintain Berkeleytime.
        </p>
        <div className={styles.carouselContainer}>
          <div className={styles.carousel}>
            <div className={styles.carouselTrack}>
              {ABOUT_IMAGES.map((image, index) => {
                const { translateX, scale, isVisible, zIndex } =
                  getImageTransform(index);

                return (
                  <div
                    key={index}
                    className={styles.carouselImageWrapper}
                    style={{
                      transform: `translateX(${translateX}px) scale(${scale})`,
                      opacity: isVisible ? 1 : 0,
                      zIndex: zIndex,
                      pointerEvents: isVisible ? "auto" : "none",
                    }}
                  >
                    <img
                      src={image}
                      alt={`Team photo ${index + 1}`}
                      className={styles.carouselImage}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <button
            className={`${styles.carouselButton} ${styles.carouselButtonLeft}`}
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            <NavArrowLeft />
          </button>
          <button
            className={`${styles.carouselButton} ${styles.carouselButtonRight}`}
            onClick={goToNext}
            aria-label="Next image"
          >
            <NavArrowRight />
          </button>
        </div>
      </div>

      {/* Our Values Section */}
      <div className={styles.valuesSection}>
        <h2 className={styles.title}>Our Values</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className={styles.valueTitle}>Growth</h3>
            <p className={styles.valueDescription}>
              You'll grow your technical skills as you tackle real challenging
              design and engineering problems.
            </p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>
              <LightBulb width={48} height={48} />
            </div>
            <h3 className={styles.valueTitle}>Curiosity</h3>
            <p className={styles.valueDescription}>
              We value team members that are curious about solving difficult
              problems and seek out solutions independently.
            </p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <h3 className={styles.valueTitle}>Passion</h3>
            <p className={styles.valueDescription}>
              Genuine commitment and dedication are critical to moving the
              Berkeleytime product forward.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.ourTeamSection}>
        <div className={styles.header} style={{ marginBottom: 24 }}>
          <h2 className={styles.title}>Our Team</h2>
          <div className={styles.spacer} />
          <div className={styles.selectWrapper}>
            <Select
              searchable
              options={termOptions}
              value={selectedTerm}
              onChange={(newValue) => {
                if (newValue && !Array.isArray(newValue)) {
                  setSelectedTerm({
                    year: newValue.year,
                    semester: newValue.semester,
                  });
                }
              }}
              placeholder="Select term"
              searchPlaceholder="Search terms..."
            />
          </div>
        </div>
        <div className={styles.teamNavigation}>
          <button
            className={`${styles.teamButton} ${
              selectedTeam === null ? styles.teamButtonActive : ""
            }`}
            onClick={() => setSelectedTeam(null)}
          >
            All
          </button>
          <button
            className={`${styles.teamButton} ${
              selectedTeam === "Leadership" ? styles.teamButtonActive : ""
            }`}
            onClick={() => setSelectedTeam("Leadership")}
          >
            Leadership
          </button>
          {availableTeams.map((team) => (
            <button
              key={team}
              className={`${styles.teamButton} ${
                selectedTeam === team ? styles.teamButtonActive : ""
              }`}
              onClick={() => setSelectedTeam(team)}
            >
              {team}
            </button>
          ))}
        </div>
        <div className={styles.grid}>
          {filteredTeamMembers?.map((member) => {
            // Get the role for the latest semester
            const displayRole = member.roles.find(
              (role) =>
                role.year === (selectedTerm ?? latestTerm).year &&
                role.semester === (selectedTerm ?? latestTerm).semester
            );

            const fillInField = (field: "photo" | "altPhoto") => {
              const startIndex = availableTerms.findIndex(
                (term) =>
                  term.year === (selectedTerm ?? latestTerm).year &&
                  term.semester === (selectedTerm ?? latestTerm).semester
              );
              for (let offset = 1; offset < availableTerms.length; offset++) {
                // Try negative offset first (earlier terms)
                const earlierIndex = startIndex - offset;
                if (earlierIndex >= 0) {
                  const term = availableTerms[earlierIndex];
                  const role = member.roles.find(
                    (r) => r.year === term.year && r.semester === term.semester
                  );
                  if (role?.[field]) {
                    return role[field];
                  }
                }

                // Try positive offset (later terms)
                const laterIndex = startIndex + offset;
                if (laterIndex < availableTerms.length) {
                  const term = availableTerms[laterIndex];
                  const role = member.roles.find(
                    (r) => r.year === term.year && r.semester === term.semester
                  );
                  if (role?.[field]) {
                    return role[field];
                  }
                }
              }
              return undefined;
            };
            return (
              <MemberCard
                key={member.id}
                name={member.name}
                imageUrl={displayRole!.photo ?? fillInField("photo")}
                altImageUrl={displayRole!.altPhoto ?? fillInField("altPhoto")}
                role={displayRole!.role}
                link={member.personalLink || undefined}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.alumniSection}>
        <h2 className={styles.title}>Alumni</h2>
        <div className={styles.yearNavigation}>
          {availableAlumniYears.map((year) => (
            <button
              key={year}
              className={`${styles.yearButton} ${
                selectedAlumniYear === year ? styles.yearButtonActive : ""
              }`}
              onClick={() => setSelectedAlumniYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
        <div className={styles.alumniGrid}>
          {filteredAlumni?.map((member) => {
            // Get the role for the selected year, or the most recent alumni role
            const roleForYear =
              selectedAlumniYear !== null
                ? member.roles.find((r) => r.year === selectedAlumniYear)
                : member.roles.find(
                    (r) =>
                      r.year === latestTerm.year &&
                      r.semester === latestTerm.semester
                  );
            const displayRole = roleForYear || member.roles[0];

            const isPresident = displayRole.role
              .toLowerCase()
              .includes("president");

            return (
              <MemberCard
                key={member.id}
                name={member.name}
                imageUrl={undefined}
                role={displayRole.role}
                link={member.personalLink || undefined}
                showBadge={isPresident}
                badgeLabel="P"
                hideImage={true}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.alumniSection}>
        <h2 className={styles.title}>Founders</h2>
        <div className={styles.alumniGrid}>
          {FOUNDERS.map((member, index) => (
            <MemberCard
              key={`founder-${index}`}
              name={member.name}
              imageUrl={undefined}
              role={member.role}
              link={member.link || undefined}
              hideImage={true}
            />
          ))}
        </div>
        <h2 className={styles.title}>Founding Team</h2>
        <div className={styles.alumniGrid}>
          {FOUNDING_TEAM.map((member, index) => (
            <MemberCard
              key={`founding-${index}`}
              name={member.name}
              imageUrl={undefined}
              role={member.role}
              link={member.link || undefined}
              hideImage={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
