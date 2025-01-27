import { EmojiTalkingHappy, Leaf, LightBulbOn } from "iconoir-react";

import styles from "./About.module.scss";
// import CurrentContributors from '../components/About/CurrentContributors';
// import PastContributors from '../components/About/PastContributors';
import AboutCarousel from "./AboutCarousel";
import { Contributors } from "./Contributors";

export default function About() {
  return (
    <div className={styles.about}>
      <div className={styles.aboutOurTeam}>
        <h2 className="mb-2">About Our Team</h2>
        <p className="mb-3">
          We&apos;re a small group of student volunteers at UC Berkeley,
          dedicated to simplifying the course discovery experience. We actively
          build, improve and maintain Berkeleytime.
        </p>
        {/* <Button variant="inverted" link_to="/apply">Join Our Team</Button> */}
      </div>
      <AboutCarousel />
      <div className={styles.values}>
        <h3>Our Values</h3>
        <div className={styles.valueRow}>
          <div className={styles.valueCol}>
            <div className={styles.value}>
              <div className={styles.valueContent}>
                <Leaf width={60} height={60} color={"#2F80ED"} />
                <h6>Growth</h6>
                <p>
                  You’ll grow your technical skills as you tackle real
                  challenging design and engineering problems.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.valueCol}>
            <div className={styles.value}>
              <div className={styles.valueContent}>
                <LightBulbOn width={60} height={60} color={"#2F80ED"} />
                <h6>Curiosity</h6>
                <p>
                  We value team members that are curious about solving difficult
                  problems and seek out solutions independently.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.valueCol}>
            <div className={styles.value}>
              <div className={styles.valueContent}>
                <EmojiTalkingHappy width={60} height={60} color={"#2F80ED"} />
                <h6>Passion</h6>
                <p>
                  Genuine commitment and dedication are critical to moving the
                  Berkeleytime product forward.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Contributors.Current />
      <Contributors.Past />
      {/* <CurrentContributors />
			<PastContributors /> */}
    </div>
  );
}
