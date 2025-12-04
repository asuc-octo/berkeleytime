import { HalfMoon, MacOsWindow, SunLight } from "iconoir-react";
import { Link } from "react-router-dom";

import { Box, Container, PillSwitcher, useTheme } from "@repo/theme";

import styles from "./Footer.module.scss";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const items = [
    { value: "system", label: <MacOsWindow width={14} height={14} /> },
    { value: "light", label: <SunLight width={14} height={14} /> },
    { value: "dark", label: <HalfMoon width={14} height={14} /> },
  ];

  return (
    <PillSwitcher
      items={items}
      value={theme ?? "system"}
      onValueChange={(value) => setTheme(value === "system" ? null : (value as "light" | "dark"))}
      iconOnly
    />
  );
}

export default function Footer() {
  return (
    <Box px="5">
      <Container>
        <div className={styles.root}>
          <div className={styles.group}>
            <div className={styles.brandGroup}>
              <Link to="/" className={styles.brand}>
                Berkeleytime
              </Link>
              <p className={styles.description}>An ASUC OCTO project</p>
            </div>
          </div>
          <div className={styles.column}>
            <p className={styles.label}>Socials</p>
            <a
              href="https://www.instagram.com/berkeleytimeofficial/"
              target="_blank"
              className={styles.link}
            >
              Instagram
            </a>
            <a
              href="https://discord.gg/uP2bTPh99U"
              target="_blank"
              className={styles.link}
            >
              Discord
            </a>
            <a
              href="https://github.com/asuc-octo/berkeleytime"
              target="_blank"
              className={styles.link}
            >
              GitHub
            </a>
          </div>
          <div className={styles.column}>
            <p className={styles.label}>Offerings</p>
            <Link to="/catalog" className={styles.link}>
              Courses
            </Link>
            <Link to="/scheduler" className={styles.link}>
              Scheduler
            </Link>
            <Link to="/gradtrak" className={styles.link}>
              Gradtrak
            </Link>
            <Link to="/grades" className={styles.link}>
              Grades
            </Link>
            <Link to="/enrollment" className={styles.link}>
              Enrollment
            </Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()}, Berkeleytime.</span>
          <ThemeSwitcher />
        </div>
      </Container>
    </Box>
  );
}
