import _ from "lodash";
import Details from "@/components/Details";
import useClass from "@/hooks/useClass";
import { UserSubmittedData } from "./UserSubmittedData";

import styles from "./Overview.module.scss";

export default function Overview() {
  const { class: _class } = useClass();
  return (
    <div className={styles.root}>
      <Details {..._class.primarySection.meetings[0]} />
      <p className={styles.userSubmissionLabel}>Description</p>
      <p className={styles.userSubmissionDescription}>
        {_class.description ?? _class.course.description}
      </p>
      <UserSubmittedData />
    </div>
  );
}

