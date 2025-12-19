import { useState } from "react";

import { Search } from "iconoir-react";

import { IconButton, Select } from "@repo/theme";

import styles from "./About.module.scss";
import { MemberCard } from "./MemberCard";

const SEMESTERS = [
  { value: "spring-2026", label: "Spring 2026" },
  { value: "fall-2025", label: "Fall 2025" },
  { value: "spring-2025", label: "Spring 2025" },
  { value: "fall-2024", label: "Fall 2024" },
  { value: "spring-2024", label: "Spring 2024" },
  { value: "fall-2023", label: "Fall 2023" },
  { value: "spring-2023", label: "Spring 2023" },
  { value: "fall-2022", label: "Fall 2022" },
  { value: "founding", label: "Founders" },
];

const TEAM_MEMBERS = [
  { name: "Alex Chen", role: "President", link: "https://linkedin.com/in/" },
  { name: "Sarah Kim", role: "VP Engineering", link: "https://linkedin.com/in/" },
  { name: "Michael Park", role: "VP Design", link: "https://linkedin.com/in/" },
  { name: "Emily Zhang", role: "VP Product", link: "https://linkedin.com/in/" },
  { name: "David Lee", role: "Tech Lead", link: "https://linkedin.com/in/" },
  { name: "Jessica Wu", role: "Design Lead", link: "https://linkedin.com/in/" },
  { name: "Ryan Patel", role: "Backend Lead", link: "https://linkedin.com/in/" },
  { name: "Amanda Liu", role: "Frontend Lead", link: "https://linkedin.com/in/" },
  { name: "Kevin Nguyen", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Rachel Wang", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Brian Tran", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Michelle Huang", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Justin Cho", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Stephanie Lin", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Andrew Yang", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Nicole Cheng", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Christopher Ma", role: "Designer", link: "https://linkedin.com/in/" },
  { name: "Jennifer Sun", role: "Designer", link: "https://linkedin.com/in/" },
  { name: "Daniel Lim", role: "Designer", link: "https://linkedin.com/in/" },
  { name: "Ashley Tan", role: "Designer", link: "https://linkedin.com/in/" },
  { name: "Matthew Ho", role: "Designer", link: "https://linkedin.com/in/" },
  { name: "Victoria Guo", role: "Designer", link: "https://linkedin.com/in/" },
  { name: "Jonathan Xu", role: "Product Manager", link: "https://linkedin.com/in/" },
  { name: "Samantha Yee", role: "Product Manager", link: "https://linkedin.com/in/" },
  { name: "Tyler Chang", role: "Data Analyst", link: "https://linkedin.com/in/" },
  { name: "Olivia Zhao", role: "Data Analyst", link: "https://linkedin.com/in/" },
  { name: "Brandon Shi", role: "DevOps", link: "https://linkedin.com/in/" },
  { name: "Katherine Lau", role: "DevOps", link: "https://linkedin.com/in/" },
  { name: "Nathan Fong", role: "QA Engineer", link: "https://linkedin.com/in/" },
  { name: "Grace Chu", role: "QA Engineer", link: "https://linkedin.com/in/" },
  { name: "Eric Wong", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Megan Tsai", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Steven Hsu", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Christina Lai", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Patrick Kwan", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Diana Ye", role: "Designer", link: "https://linkedin.com/in/" },
  { name: "Jason Cheung", role: "Designer", link: "https://linkedin.com/in/" },
  { name: "Vanessa Lu", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Henry Tam", role: "Developer", link: "https://linkedin.com/in/" },
  { name: "Cynthia Ong", role: "Developer", link: "https://linkedin.com/in/" },
];

export default function About() {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(
    "spring-2026"
  );

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>Our Team</h2>
        <div className={styles.spacer} />
        <div className={styles.selectWrapper}>
          <Select
            searchable
            options={SEMESTERS}
            value={selectedSemester}
            onChange={(value) => setSelectedSemester(value as string | null)}
            placeholder="Select semester"
            searchPlaceholder="Search..."
          />
        </div>
        <IconButton style={{ width: 44, height: 44 }}>
          <Search />
        </IconButton>
      </div>
      <div className={styles.grid}>
        {TEAM_MEMBERS.map((member) => (
          <MemberCard
            key={member.name}
            name={member.name}
            role={member.role}
            link={member.link}
          />
        ))}
      </div>
    </div>
  );
}
