import { useEffect, useMemo, useRef, useState, UIEvent } from "react";

import { LightBulb, NavArrowLeft, NavArrowRight } from "iconoir-react";

import styles from "./About.module.scss";
import { MemberCard } from "./MemberCard";

// Helper function to create a staff member following the StaffMember schema
const createStaffMember = (
  id: string,
  name: string,
  role: string,
  personalLink: string | null,
  year: number,
  semester: "Spring" | "Summer" | "Fall" | "Winter",
  team?: string,
  photo?: string,
  isAlumni: boolean = false,
  isLeadership: boolean = false
) => ({
  id,
  userId: null,
  name,
  personalLink,
  roles: [
    {
      id: `${id}-role-1`,
      year,
      semester,
      role,
      team: team || null,
      photo: photo || null,
      isAlumni,
      isLeadership,
    },
  ],
});

const TEAM_MEMBERS = [
  createStaffMember(
    "1",
    "Alex Chen",
    "President",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    undefined,
    undefined,
    false,
    true // isLeadership
  ),
  createStaffMember(
    "2",
    "Sarah Kim",
    "VP Engineering",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    true // isLeadership
  ),
  createStaffMember(
    "3",
    "Michael Park",
    "VP Design",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Design",
    undefined,
    false,
    true // isLeadership
  ),
  createStaffMember(
    "4",
    "Emily Zhang",
    "VP Product",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Product",
    undefined,
    false,
    true // isLeadership
  ),
  createStaffMember(
    "5",
    "David Lee",
    "Tech Lead",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    true // isLeadership
  ),
  createStaffMember(
    "6",
    "Jessica Wu",
    "Design Lead",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Design",
    undefined,
    false,
    true // isLeadership
  ),
  createStaffMember(
    "7",
    "Ryan Patel",
    "Backend Lead",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    true // isLeadership
  ),
  createStaffMember(
    "8",
    "Amanda Liu",
    "Frontend Lead",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    true // isLeadership
  ),
  createStaffMember(
    "9",
    "Kevin Nguyen",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "10",
    "Rachel Wang",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "11",
    "Brian Tran",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "12",
    "Michelle Huang",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "13",
    "Justin Cho",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "14",
    "Stephanie Lin",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "15",
    "Andrew Yang",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "16",
    "Nicole Cheng",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "17",
    "Christopher Ma",
    "Designer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Design",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "18",
    "Jennifer Sun",
    "Designer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Design",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "19",
    "Daniel Lim",
    "Designer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Design",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "20",
    "Ashley Tan",
    "Designer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Design",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "21",
    "Matthew Ho",
    "Designer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Design",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "22",
    "Victoria Guo",
    "Designer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Design",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "23",
    "Jonathan Xu",
    "Product Manager",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Product",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "24",
    "Samantha Yee",
    "Product Manager",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Product",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "25",
    "Tyler Chang",
    "Data Analyst",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Data",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "26",
    "Olivia Zhao",
    "Data Analyst",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Data",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "27",
    "Brandon Shi",
    "DevOps",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "28",
    "Katherine Lau",
    "DevOps",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "29",
    "Nathan Fong",
    "QA Engineer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "30",
    "Grace Chu",
    "QA Engineer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "31",
    "Eric Wong",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "32",
    "Megan Tsai",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "33",
    "Steven Hsu",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "34",
    "Christina Lai",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "35",
    "Patrick Kwan",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "36",
    "Diana Ye",
    "Designer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Design",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "37",
    "Jason Cheung",
    "Designer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Design",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "38",
    "Vanessa Lu",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "39",
    "Henry Tam",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
  createStaffMember(
    "40",
    "Cynthia Ong",
    "Developer",
    "https://linkedin.com/in/",
    2026,
    "Spring",
    "Engineering",
    undefined,
    false,
    false // isLeadership
  ),
];

// Founding Team data
const FOUNDING_TEAM = [
  { name: "Christine Wang", role: "Fullstack Engineer", link: "https://www.linkedin.com/in/cwang395/" },
  { name: "Emily Chen", role: "Fullstack Engineer", link: null },
  { name: "Eric Huynh", role: "Fullstack Engineer", link: "http://erichuynhing.com/" },
  { name: "Jennifer Yu", role: "Fullstack Engineer", link: null },
  { name: "Justin Lu", role: "Fullstack Engineer", link: null },
  { name: "Kelvin Leong", role: "Fullstack Engineer", link: "https://www.linkedin.com/in/kelvinjleong/" },
  { name: "Kevin Jiang", role: "Fullstack Engineer", link: "https://github.com/kevjiangba/" },
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
  { name: "Ashwin Iyengar", role: "Co-Founder", link: "http://ashwiniyengar.github.io/" },
  { name: "Noah Gilmore", role: "Co-Founder", link: "https://noahgilmore.com/" },
  { name: "Yuxin Zhu", role: "Co-Founder", link: "http://yuxinzhu.com/" },
];

// Sample alumni data - in production, this would come from GraphQL
// Filtering by members who have at least one role with isAlumni: true
const ALL_ALUMNI = [
  {
    id: "alum-1",
    userId: null,
    name: "First Last",
    personalLink: "https://linkedin.com/in/",
    roles: [
      {
        id: "alum-1-role-1",
        year: 2024,
        semester: "Spring" as const,
        role: "President",
        team: null,
        photo: null,
        isAlumni: true,
        isLeadership: true,
      },
    ],
  },
  {
    id: "alum-2",
    userId: null,
    name: "John Doe",
    personalLink: "https://linkedin.com/in/",
    roles: [
      {
        id: "alum-2-role-1",
        year: 2023,
        semester: "Fall" as const,
        role: "Former President",
        team: null,
        photo: null,
        isAlumni: true,
        isLeadership: true,
      },
    ],
  },
  {
    id: "alum-3",
    userId: null,
    name: "Jane Smith",
    personalLink: "https://linkedin.com/in/",
    roles: [
      {
        id: "alum-3-role-1",
        year: 2023,
        semester: "Spring" as const,
        role: "VP Engineering",
        team: "Engineering",
        photo: null,
        isAlumni: true,
        isLeadership: true,
      },
    ],
  },
  {
    id: "alum-4",
    userId: null,
    name: "Bob Johnson",
    personalLink: "https://linkedin.com/in/",
    roles: [
      {
        id: "alum-4-role-1",
        year: 2022,
        semester: "Fall" as const,
        role: "Tech Lead",
        team: "Engineering",
        photo: null,
        isAlumni: true,
        isLeadership: true,
      },
    ],
  },
  {
    id: "alum-5",
    userId: null,
    name: "Alice Williams",
    personalLink: "https://linkedin.com/in/",
    roles: [
      {
        id: "alum-5-role-1",
        year: 2022,
        semester: "Spring" as const,
        role: "Design Lead",
        team: "Design",
        photo: null,
        isAlumni: true,
        isLeadership: true,
      },
    ],
  },
];

// Generate years from current year down to 2018
const getAvailableYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2018; year--) {
    years.push(year);
  }
  return years;
};

const AVAILABLE_YEARS = getAvailableYears();

const ABOUT_IMAGES = [
  "/images/about1.png",
  "/images/about2.png",
  "/images/about3.png",
  "/images/about4.png",
  "/images/about5.png",
];

// Find the latest semester from all team members
const findLatestSemester = () => {
  const semesterOrder: Record<string, number> = {
    Spring: 0,
    Summer: 1,
    Fall: 2,
    Winter: 3,
  };

  let latestYear = 0;
  let latestSemester: "Spring" | "Summer" | "Fall" | "Winter" = "Spring";

  TEAM_MEMBERS.forEach((member) => {
    member.roles.forEach((role) => {
      if (role.year > latestYear) {
        latestYear = role.year;
        latestSemester = role.semester;
      } else if (role.year === latestYear) {
        const currentOrder = semesterOrder[latestSemester] ?? 0;
        const roleOrder = semesterOrder[role.semester] ?? 0;
        if (roleOrder > currentOrder) {
          latestSemester = role.semester;
        }
      }
    });
  });

  return { year: latestYear, semester: latestSemester };
};

const LATEST_SEMESTER = findLatestSemester();

// Get all unique teams from the latest semester
const getTeamsFromLatestSemester = () => {
  const teams = new Set<string>();
  TEAM_MEMBERS.forEach((member) => {
    member.roles.forEach((role) => {
      if (
        role.year === LATEST_SEMESTER.year &&
        role.semester === LATEST_SEMESTER.semester &&
        role.team
      ) {
        teams.add(role.team);
      }
    });
  });
  return Array.from(teams).sort();
};

const AVAILABLE_TEAMS = getTeamsFromLatestSemester();

export default function About() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(
    new Date().getFullYear()
  );
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter team members to only show those in the latest semester
  const membersInLatestSemester = useMemo(() => {
    return TEAM_MEMBERS.filter((member) =>
      member.roles.some(
        (role) =>
          role.year === LATEST_SEMESTER.year &&
          role.semester === LATEST_SEMESTER.semester
      )
    );
  }, []);

  // Filter by team or leadership
  const filteredTeamMembers = useMemo(() => {
    let filtered = membersInLatestSemester;

    if (selectedTeam === "Leadership") {
      filtered = filtered.filter((member) =>
        member.roles.some(
          (role) =>
            role.year === LATEST_SEMESTER.year &&
            role.semester === LATEST_SEMESTER.semester &&
            role.isLeadership
        )
      );
    } else if (selectedTeam) {
      filtered = filtered.filter((member) =>
        member.roles.some(
          (role) =>
            role.year === LATEST_SEMESTER.year &&
            role.semester === LATEST_SEMESTER.semester &&
            role.team === selectedTeam
        )
      );
    }

    // Sort: leadership first, then alphabetically by name
    return filtered.sort((a, b) => {
      const aHasLeadership = a.roles.some(
        (r) =>
          r.year === LATEST_SEMESTER.year &&
          r.semester === LATEST_SEMESTER.semester &&
          r.isLeadership
      );
      const bHasLeadership = b.roles.some(
        (r) =>
          r.year === LATEST_SEMESTER.year &&
          r.semester === LATEST_SEMESTER.semester &&
          r.isLeadership
      );

      if (aHasLeadership && !bHasLeadership) return -1;
      if (!aHasLeadership && bHasLeadership) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [selectedTeam, membersInLatestSemester]);

  // Filter alumni by selected year
  // An alumnus is shown for a year if they have at least one role with isAlumni: true in that year
  const filteredAlumni = useMemo(() => {
    if (selectedYear === null) return ALL_ALUMNI;

    return ALL_ALUMNI.filter((member) =>
      member.roles.some(
        (role) => role.isAlumni && role.year === selectedYear
      )
    );
  }, [selectedYear]);

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
          simplifying the course discovery experience. We actively build, improve
          and maintain Berkeleytime.
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
      <div className={styles.header}>
        <h2 className={styles.title}>Our Team</h2>
        <div className={styles.spacer} />
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
        {AVAILABLE_TEAMS.map((team) => (
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
        {filteredTeamMembers.map((member) => {
          // Get the role for the latest semester
          const latestRole = member.roles.find(
            (role) =>
              role.year === LATEST_SEMESTER.year &&
              role.semester === LATEST_SEMESTER.semester
          );
          const displayRole = latestRole || member.roles[member.roles.length - 1];
          return (
            <MemberCard
              key={member.id}
              name={member.name}
              imageUrl={displayRole.photo || "https://m.media-amazon.com/images/M/MV5BZTJjZTcxYjktZTU5ZS00YzdhLWJjMzYtOWY0M2MxZDEzZWUyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"}
              role={displayRole.role}
              link={member.personalLink || undefined}
            />
          );
        })}
      </div>

      <div className={styles.alumniSection}>
        <h2 className={styles.title}>Alumni</h2>
        <div className={styles.yearNavigation}>
          {AVAILABLE_YEARS.map((year) => (
            <button
              key={year}
              className={`${styles.yearButton} ${
                selectedYear === year ? styles.yearButtonActive : ""
              }`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
        <div className={styles.alumniGrid}>
          {filteredAlumni.map((member) => {
            // Get the role for the selected year, or the most recent alumni role
            const roleForYear =
              selectedYear !== null
                ? member.roles.find(
                    (r) => r.isAlumni && r.year === selectedYear
                  )
                : member.roles.find((r) => r.isAlumni);
            const displayRole = roleForYear || member.roles[0];

            const isPresident =
              displayRole.role.toLowerCase().includes("president");

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
      </div>
    </div>
  );
}
