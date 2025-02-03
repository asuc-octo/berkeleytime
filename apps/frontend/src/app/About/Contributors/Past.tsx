import { Globe, Trophy } from "iconoir-react";

import { past } from "../../../lib/contributors";
import styles from "./Contributors.module.scss";
import { Tooltip } from "@repo/theme";

const Past = () => (
  <div>
    <h3>Alumni</h3>
    {past.map((section) => (
      <div key={section.name} className={styles.pastContributors}>
        <h6>{section.name}</h6>
        <div>
          {section.items
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((member) => (
              <div key={member.name} className={styles.contributorCard}>
                <div className={styles.contributorCardBody}>
                  <div className={styles.bio}>
                    <div className={styles.name}>
                      <p>{member.name}</p>
                    </div>
                    {member.role ? (
                      <div className={styles.role}>{member.role}</div>
                    ) : null}
                  </div>
                  <div className={styles.bio}>
                    {member.site ? (
                      <a href={member.site}>
                        <Globe width={16} height={16} color={"#8A8A8A"} />
                      </a>
                    ) : null}
                    <br />
                    {member.podCupWins && member.podCupWins.length > 0 ? (
                      <Tooltip
                        content={`Pod Cup Winner: ${member.podCupWins
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
    ))}
  </div>
);

export default Past;
