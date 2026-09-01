import {
  BrainResearch,
  CodeBrackets,
  CoffeeCup,
  DesignNib,
  Megaphone,
  OpenNewWindow,
} from "iconoir-react";

import { Button } from "@repo/theme";

import { useTracking } from "@/hooks/api/tracking/useTracking";

import styles from "./Apply.module.scss";

const APPLICATION_FORM_URL = "https://forms.gle/kUtzz74eeV8BiMKw6";
const COFFEE_CHATS_URL =
  "https://airtable.com/appS2E6oOWx3AeOmx/shrTOrgzZCdPK5Czv";
const COFFEE_CHATS_EMBED_URL =
  "https://airtable.com/embed/appS2E6oOWx3AeOmx/shrTOrgzZCdPK5Czv";

const ROLES = [
  {
    icon: CodeBrackets,
    title: "Software Engineer",
    description:
      "Build and ship features used by thousands of students every semester. Work across our React frontend, Node.js/GraphQL backend, and data pipelines — all you need is curiosity and a willingness to learn.",
  },
  {
    icon: DesignNib,
    title: "Product Designer",
    description:
      "Shape how Berkeleytime looks and feels. Design interfaces from wireframes to high-fidelity mockups, and work side-by-side with engineers to bring your designs to life.",
  },
  {
    icon: BrainResearch,
    title: "User Researcher",
    description:
      "Be the voice of our users. Run interviews, surveys, and usability tests with Berkeley students, and turn what you learn into insights that guide what we build next.",
  },
  {
    icon: Megaphone,
    title: "Marketing & Content Creator",
    description:
      "Grow Berkeleytime's presence on campus and online. Run our social media, write posts, and produce video content that shows students what we do.",
  },
];

function ApplyButton({ position }: { position: "top" | "bottom" }) {
  const { trackClick } = useTracking();

  return (
    <Button
      as="a"
      href={APPLICATION_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.applyButton}
      onClick={() =>
        trackClick("apply-button", position, {
          destination: APPLICATION_FORM_URL,
        })
      }
    >
      Apply Now
      <OpenNewWindow width={18} height={18} aria-hidden="true" />
      <span className={styles.visuallyHidden}>(opens in a new tab)</span>
    </Button>
  );
}

export default function Apply() {
  return (
    <div className={styles.root}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Join the Team</h1>
        <p className={styles.heroDescription}>
          Love using Berkeleytime? Help us build it. We're a small group of
          student volunteers at UC Berkeley dedicated to simplifying the course
          discovery experience — and we're looking for engineers, designers,
          researchers, and marketers to join us. No experience required.
        </p>
        <ApplyButton position="top" />
      </div>

      <div className={styles.section}>
        <h2 className={styles.title}>Open Roles</h2>
        <div className={styles.rolesGrid}>
          {ROLES.map((role) => (
            <div key={role.title} className={styles.roleCard}>
              <div className={styles.roleIcon}>
                <role.icon width={40} height={40} aria-hidden="true" />
              </div>
              <h3 className={styles.roleTitle}>{role.title}</h3>
              <p className={styles.roleDescription}>{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.coffeeChatsHeader}>
          <CoffeeCup
            width={32}
            height={32}
            className={styles.coffeeIcon}
            aria-hidden="true"
          />
          <h2 className={styles.title}>Coffee Chats</h2>
        </div>
        <p className={styles.sectionDescription}>
          Questions about the team or a role? Book a coffee chat with a member
          of our team — before or after you apply. Browse the profiles below and
          grab a time that works for you.
        </p>
        <iframe
          src={COFFEE_CHATS_EMBED_URL}
          title="Book a coffee chat with the Berkeleytime team"
          className={styles.coffeeChatsEmbed}
          loading="lazy"
        />
        <a
          href={COFFEE_CHATS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.fallbackLink}
        >
          Open the coffee chat scheduler in a new tab
          <OpenNewWindow width={14} height={14} aria-hidden="true" />
        </a>
      </div>

      <div className={styles.ctaSection}>
        <h2 className={styles.title}>Ready to apply?</h2>
        <p className={styles.sectionDescription}>
          Fill out our short application and we'll be in touch.
        </p>
        <ApplyButton position="bottom" />
      </div>
    </div>
  );
}
