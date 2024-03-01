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
      <div className={styles.log_col}>
        {releases.map(rel => {
          console.log(rel);
          return (
            <div className={styles.log}>
                <h3>{rel.date}</h3>
                <h2>🤩 What's New</h2>
                <ul>
                  {rel.updates.map(item => {
                    return <li>{item}</li>
                  })}
                </ul>
                <h2>🐛 Bug Fixes</h2>
                <ul>
                  {rel.fixes.map(item => {
                    return <li>{item}</li>
                  })}
                </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Releases;
