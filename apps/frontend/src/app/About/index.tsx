import { UIEvent, useEffect, useMemo, useRef, useState } from "react";

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

export default function About() {
  const { data: allStaffMembers, loading: allStaffMembersLoading } = useQuery(
    GetAllStaffMembersDocument
  );

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedAlumniYear, setSelectedAlumniYear] = useState<number | null>(
    null
  );
  const carouselRef = useRef<HTMLDivElement>(null);

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
        )
      )
        return;
      const latestRole = member.roles.sort((a, b) => b.year - a.year)[0];
      years.add(latestRole.year);
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
    return allStaffMembers?.allStaffMembers?.filter(
      (member) =>
        !member.roles.some(
          (role) =>
            role.year === latestTerm.year &&
            role.semester === latestTerm.semester
        ) && member.roles.some((role) => role.year === selectedAlumniYear)
    );
  }, [allStaffMembers, latestTerm, selectedAlumniYear]);

  console.log(allStaffMembers);
  console.log(selectedTeam, selectedTerm);
  console.log(
    latestTerm,
    availableAlumniYears,
    availableTerms,
    availableTeams,
    selectedAlumniYear,
    filteredTeamMembers,
    filteredAlumni
  );

  // Create infinite scroll by duplicating images
  const infiniteImages = useMemo(() => {
    return [...ABOUT_IMAGES, ...ABOUT_IMAGES, ...ABOUT_IMAGES];
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      // Start at the middle set of images
      const imageWidth = carouselRef.current.scrollWidth / 3;
      carouselRef.current.scrollLeft = imageWidth;
    }
  }, []);

  const handleCarouselScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth } = event.target as HTMLDivElement;
    const imageSetWidth = scrollWidth / 3;

    // If scrolled to the first set, jump to the middle set
    if (scrollLeft < imageSetWidth * 0.5) {
      carouselRef.current.scrollLeft = imageSetWidth + scrollLeft;
    }
    // If scrolled to the last set, jump to the middle set
    else if (scrollLeft > imageSetWidth * 2.5) {
      carouselRef.current.scrollLeft = scrollLeft - imageSetWidth;
    }
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    // Scroll by one image width (800px) plus gap (16px)
    const scrollAmount = 816;
    const newScrollLeft =
      direction === "left"
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
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
          <div
            className={styles.carousel}
            ref={carouselRef}
            onScroll={handleCarouselScroll}
          >
            {infiniteImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Team photo ${(index % ABOUT_IMAGES.length) + 1}`}
                className={styles.carouselImage}
              />
            ))}
          </div>
          <button
            className={`${styles.carouselButton} ${styles.carouselButtonLeft}`}
            onClick={() => scrollCarousel("left")}
            aria-label="Previous image"
          >
            <NavArrowLeft />
          </button>
          <button
            className={`${styles.carouselButton} ${styles.carouselButtonRight}`}
            onClick={() => scrollCarousel("right")}
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
                    (r) =>
                      r.year === term.year && r.semester === term.semester
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
                    (r) =>
                      r.year === term.year && r.semester === term.semester
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
