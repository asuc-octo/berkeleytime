import styles from "./AboutTeam.module.scss";

export default function AboutTeam() {
  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>About our team</h2>
      <p className={styles.description}>
        We're a small group of student volunteers at UC Berkeley, dedicated to
        simplifying the course discovery experience. We actively build, improve
        and maintain Berkeleytime.
      </p>
    </section>
  );
}
