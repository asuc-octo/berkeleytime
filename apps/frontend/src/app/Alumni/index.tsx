import { useMemo, useState } from "react";

import { MemberCard } from "../About/MemberCard";
import styles from "./Alumni.module.scss";

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

export default function Alumni() {
  const [selectedYear, setSelectedYear] = useState<number | null>(
    new Date().getFullYear()
  );

  // Filter alumni by selected year
  // An alumnus is shown for a year if they have at least one role with isAlumni: true in that year
  const filteredAlumni = useMemo(() => {
    if (selectedYear === null) return ALL_ALUMNI;

    return ALL_ALUMNI.filter((member) =>
      member.roles.some((role) => role.isAlumni && role.year === selectedYear)
    );
  }, [selectedYear]);

  return (
    <div className={styles.root}>
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
      <div className={styles.grid}>
        {filteredAlumni.map((member) => {
          // Get the role for the selected year, or the most recent alumni role
          const roleForYear =
            selectedYear !== null
              ? member.roles.find((r) => r.isAlumni && r.year === selectedYear)
              : member.roles.find((r) => r.isAlumni);
          const displayRole = roleForYear || member.roles[0];

          const isPresident = displayRole.role
            .toLowerCase()
            .includes("president");

          return (
            <MemberCard
              key={member.id}
              name={member.name}
              imageUrl={
                displayRole.photo ||
                "https://m.media-amazon.com/images/M/MV5BZTJjZTcxYjktZTU5ZS00YzdhLWJjMzYtOWY0M2MxZDEzZWUyXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
              }
              role={displayRole.role}
              link={member.personalLink || undefined}
              showBadge={isPresident}
              badgeLabel="P"
            />
          );
        })}
      </div>
    </div>
  );
}
