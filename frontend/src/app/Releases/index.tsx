import Release from "./Release";
import styles from "./Releases.module.scss";
import log from "./log.json"

const Releases = () => {

  const releases = log.releases;
  console.log(releases)

  return (
    <div className={styles.root}>
      <div className={styles.heading}>
          <h2>Berkeleytime Releases</h2>
          <h3>Keep up-to-date with our releases and bug fixes.</h3>
      </div>
      {releases.map(rel => {
        return (
          <div className={styles.log}>
              <h3 className={styles.heading}>{rel.date}</h3>
              <h2 className={styles.heading}>🤩 What's New</h2>
              <ul>
                {rel.updates.map(item => {
                  return <li>{item}</li>
                })}
              </ul>
              <h2 className={styles.heading}>🐛 Bug Fixes</h2>
              <ul>
                {rel.fixes.map(item => {
                  return <li>{item}</li>
                })}
              </ul>
          </div>
        );
      })}
    </div>
  );
};

export default Releases;
