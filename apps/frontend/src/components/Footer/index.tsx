import classNames from "classnames";
import {
  Discord,
  Facebook,
  Github,
  HalfMoon,
  Instagram,
  SunLight,
} from "iconoir-react";
import { Link } from "react-router-dom";

import Container from "@/components/Container";
import useTheme from "@/hooks/useTheme";

import IconButton from "../IconButton";
import styles from "./Footer.module.scss";

interface FooterProps {
  invert?: boolean;
}

export default function Footer({ invert }: FooterProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Container>
      <div
        className={classNames(styles.root, {
          [styles.invert]: invert,
        })}
      >
        <div className={styles.group}>
          <Link to="/" className={styles.brand}>
            Berkeleytime
          </Link>
          <p className={styles.description}>
            An{" "}
            <a
              href="https://octo.asuc.org/"
              target="_blank"
              className={styles.link}
            >
              ASUC OCTO
            </a>{" "}
            project
          </p>
          <div className={styles.row}>
            <IconButton
              invert={invert}
              onClick={() =>
                setTheme((theme) => (theme === "dark" ? "light" : "dark"))
              }
            >
              {theme === "dark" ? <SunLight /> : <HalfMoon />}
            </IconButton>
            <a href="https://www.instagram.com/" target="_blank">
              <IconButton invert={invert}>
                <Instagram />
              </IconButton>
            </a>
            <a href="https://discord.gg/uP2bTPh99U" target="_blank">
              <IconButton invert={invert}>
                <Discord />
              </IconButton>
            </a>
            <a href="https://facebook.com/berkeleytime" target="_blank">
              <IconButton invert={invert}>
                <Facebook />
              </IconButton>
            </a>
            <a href="https://github.com/asuc-octo/berkeleytime" target="_blank">
              <IconButton invert={invert}>
                <Github />
              </IconButton>
            </a>
          </div>
        </div>
        <div className={styles.column}>
          <p className={styles.label}>Offerings</p>
          <Link to="/catalog" className={styles.link}>
            Courses
          </Link>
          <Link to="/scheduler" className={styles.link}>
            My schedules
          </Link>
          <Link to="/grades" className={styles.link}>
            Grades
          </Link>
          <Link to="/enrollment" className={styles.link}>
            Enrollment
          </Link>
        </div>
        <div className={styles.column}>
          <p className={styles.label}>Organization</p>
          <Link to="/about" className={styles.link}>
            About us
          </Link>
          <Link to="/scheduler" className={styles.link}>
            Frequently asked questions
          </Link>
          <Link to="/grades" className={styles.link}>
            Resources
          </Link>
        </div>
        <div className={styles.column}>
          <p className={styles.label}>Legal</p>
          <Link to="/catalog" className={styles.link}>
            Terms of service
          </Link>
          <Link to="/scheduler" className={styles.link}>
            Privacy policy
          </Link>
        </div>
      </div>
    </Container>
  );
}
