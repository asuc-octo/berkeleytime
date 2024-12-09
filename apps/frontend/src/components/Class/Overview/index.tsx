import Details from "@/components/Details";
import useClass from "@/hooks/useClass";

import styles from "./Overview.module.scss";

export default function Overview() {
  const { class: _class } = useClass();

  return (
    <div className={styles.root}>
      <Details {..._class.primarySection.meetings[0]} />
      {_class.decal ? (
        <>
          <p className={styles.label}>Contact</p>
            {_class.decal.website && (
              <p className={styles.description}>
                Course Website {" "}
                <a 
                  href={_class.decal.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {_class.decal.website}
                </a>
              </p>
            )}
            {_class.decal.contact && (
              <p className={styles.description}>
                Contact Information{" "}
                <a
                  href={`mailto:${_class.decal.contact}`}
                  className={styles.link}
                >
                  {_class.decal.contact}
                </a>
            </p>
          )}
          <p className={styles.label}>Description</p>
          <p className={styles.description}>
            {_class.decal.description || "N/A"}
          </p>
        </>
      ) : (
        <>
          <p className={styles.label}>Description</p>
          <p className={styles.description}>
            {_class.description ?? _class.course.description}
          </p>
          {_class.course.requirements && (
            <>
              <p className={styles.label}>Prerequisites</p>
              <p className={styles.description}>{_class.course.requirements}</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
