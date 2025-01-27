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
              <ProfileCircle width={64} height={64} color={"#8A8A8A"} />
            </div>
          )}
          <div className={styles.name}>
            <p>{name}</p>
            <span>
              {site ? (
                <a href={site}>
                  <Globe width={16} height={16} color={"#8A8A8A"} />
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
            </span>
          </div>
          <div className={styles.role}>{role}</div>
        </div>
      ))}
    </div>
  </div>
);

export default Current;
