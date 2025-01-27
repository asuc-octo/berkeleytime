import { Globe } from "iconoir-react";

import { past } from "../../../lib/contributors";
import styles from "./Contributors.module.scss";

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
                <div className={styles.name}>
                  <p>{member.name}</p>
                  {member.site ? (
                    <a href={member.site}>
                      <Globe width={16} height={16} color={"#8A8A8A"} />
                    </a>
                  ) : null}
                </div>
                {member.role ? (
                  <div className={styles.role}>{member.role}</div>
                ) : null}
              </div>
            ))}
        </div>
      </div>
    ))}
  </div>
);

export default Past;
