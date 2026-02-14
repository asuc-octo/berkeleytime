import { useEffect, useState } from "react";

import { HalfMoon, MacOsWindow, SunLight } from "iconoir-react";
import { Link } from "react-router-dom";

import { Container, PillSwitcher, useTheme } from "@repo/theme";

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
      onValueChange={(value) =>
        setTheme(value === "system" ? null : (value as "light" | "dark"))
      }
      iconOnly
    />
  );
}

type Status = "UP" | "HASISSUES" | "UNDERMAINTENANCE";

const STATUS_LABELS: Record<Status, string> = {
  UP: "All systems operational",
  HASISSUES: "Experiencing issues",
  UNDERMAINTENANCE: "Under maintenance",
};

function StatusBadge() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("https://berkeleytime.instatus.com/summary.json")
      .then((res) => res.json())
      .then((data) => setStatus(data.page.status as Status))
      .catch(() => setStatus("HASISSUES"));
  }, []);

  if (!status) return null;

  return (
    <a
      href="https://berkeleytime.instatus.com"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.statusBadge}
      data-status={status}
    >
      <span className={styles.statusDot} />
      {STATUS_LABELS[status]}
    </a>
  );
}

export default function Footer() {
  return (
    <Container className={styles.wrapper}>
      <div className={styles.root}>
        <div className={styles.group}>
          <div className={styles.brandGroup}>
            <Link to="/" className={styles.brand}>
              Berkeleytime
            </Link>
            <p className={styles.description}>An ASUC OCTO project</p>
            <StatusBadge />
          </div>
        </div>
        <div className={styles.columns}>
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
            <Link to="/curated" className={styles.link}>
              Curated Classes
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
          <div className={styles.column}>
            <p className={styles.label}>About Us</p>
            <Link to="/about" className={styles.link}>
              Our Team
            </Link>
            <Link to="https://octo.asuc.org/" className={styles.link}>
              OCTO
            </Link>
            <Link to="/legal/privacy" className={styles.link}>
              Privacy Policy
            </Link>
            <Link to="/legal/terms" className={styles.link}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()}, Berkeleytime.</span>
        <ThemeSwitcher />
      </div>
    </Container>
  );
}
