import { Globe, ProfileCircle, Trophy } from "iconoir-react";

import { Tooltip } from "@repo/theme";

import { current } from "@/lib/contributors";

import styles from "./Contributors.module.scss";

const Current = () => (
  <div className={styles.currentContributors}>
    <h3>{current.name}</h3>
    <div>
      {current.items.map(({ name, img, site, role, podCupWins }) => (
        <div key={name} className={styles.contributorCard}>
          {img ? (
            <div className={styles.headshot}>
              <img className={styles.serious} src={img?.base} alt={name} />
              <img src={img?.silly ? img?.silly : img?.base} alt={name} />
            </div>
          ) : (
            <div className={styles.headshotPlaceholder}>
              <ProfileCircle width={64} height={64} />
            </div>
          )}
          <div className={styles.contributorCardBody}>
            <div className={styles.bio}>
              <div className={styles.name}>
                <p>{name}</p>
              </div>
              <div className={styles.role}>{role}</div>
            </div>
            <div className={styles.links}>
              {site ? (
                <a href={site}>
                  <Globe width={16} height={16} />
                </a>
              ) : null}
              <br />
              {podCupWins && podCupWins.length > 0 ? (
                <Tooltip
                  content={`Pod Cup Winner: ${podCupWins
                    .reduce((acc, pcw) => {
                      return `${acc}, ${pcw.pod} (${pcw.semester})`;
                    }, "")
                    .substring(2)}`}
                >
                  <Trophy />
                </Tooltip>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Current;
