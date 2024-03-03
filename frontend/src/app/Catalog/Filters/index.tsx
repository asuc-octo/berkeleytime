import { ArrowSeparateVertical } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import styles from "./Filters.module.scss";

export default function Filters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleQueryChange = (value: string) => {
    if (value) searchParams.set("query", value);
    else searchParams.delete("query");
    setSearchParams(searchParams);
  };

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <div className={styles.select}>
          <div className={styles.text}>
            <div className={styles.label}>Year</div>
            <div className={styles.value}>2023</div>
          </div>
          <div className={styles.icon}>
            <ArrowSeparateVertical />
          </div>
        </div>
        <div className={styles.select}>
          <div className={styles.text}>
            <div className={styles.label}>Semester</div>
            <div className={styles.value}>Spring</div>
          </div>
          <div className={styles.icon}>
            <ArrowSeparateVertical />
          </div>
        </div>
      </div>
      <input
        className={styles.input}
        type="search"
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder="Search courses..."
      />
    </div>
  );
}
