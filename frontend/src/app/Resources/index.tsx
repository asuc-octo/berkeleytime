import styles from "./Resources.module.scss";
// import log from "./log.json"

const Resources = () => {

  const resources = [
    {
      name: "Student Advocate Office",
      description: "The Student Advocate's Office (SAO) is a free, confidential, non-partisan resource that provides one-on-one casework services for students who have academic, conduct, grievance, or financial aid concerns.",
    },
    {
      name: "Open Syllabi Initiative",
      description: "The Open Syllabi Initiative is a project pioneered by the ASUC and genUP to improve access to syllabi for classes before students officially enroll in order to facilitate the decision making process regarding course registration and assessing.",
    },
    {
      name: "Student Advocate Office",
      description: "The Student Advocate's Office (SAO) is a free, confidential, non-partisan resource that provides one-on-one casework services for students who have academic, conduct, grievance, or financial aid concerns.",
    },
    {
      name: "Open Syllabi Initiative",
      description: "The Open Syllabi Initiative is a project pioneered by the ASUC and genUP to improve access to syllabi for classes before students officially enroll in order to facilitate the decision making process regarding course registration and assessing.",
    },
    {
      name: "Student Advocate Office",
      description: "The Student Advocate's Office (SAO) is a free, confidential, non-partisan resource that provides one-on-one casework services for students who have academic, conduct, grievance, or financial aid concerns.",
    },
    {
      name: "Open Syllabi Initiative",
      description: "The Open Syllabi Initiative is a project pioneered by the ASUC and genUP to improve access to syllabi for classes before students officially enroll in order to facilitate the decision making process regarding course registration and assessing.",
    },
    {
      name: "Student Advocate Office",
      description: "The Student Advocate's Office (SAO) is a free, confidential, non-partisan resource that provides one-on-one casework services for students who have academic, conduct, grievance, or financial aid concerns.",
    },
    {
      name: "Open Syllabi Initiative",
      description: "The Open Syllabi Initiative is a project pioneered by the ASUC and genUP to improve access to syllabi for classes before students officially enroll in order to facilitate the decision making process regarding course registration and assessing.",
    },
  ];
  // console.log(releases)

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2>How can we help?</h2>
        <h3>Explore and learn from our collections of Berkeley resources.</h3>
      </div>
      <div className={styles.hr} />

      <div className={styles.body}>
        <h2>All Resources</h2>
        <div className={styles.grid}>
          { /* need to create component for resource card */ }
          {resources.map((r) => (
            <div className={styles.card}>
              <div className={styles.text}>
                <div className={styles.icon}></div>
                <h3>{r.name}</h3>
                <p>{r.description}</p>
              </div>
              <div className={styles.buttons}>
                { /* need to replace with button components*/ }
                <button className={styles.light}>Go to Site</button>
                <button className={styles.dark}>Learn More</button>
              </div>
            </div>
          ))}

        </div>

      </div>
      <div className={styles.hr} />

      <div className={styles.footer}>
        <div className={styles.left}>
          <h2>Contact</h2>
          <p>Help us grow our hub of Berkeley resources by sending in a request. We'd love to make it easier for students to explore and learn.</p>
          <button className={styles.light}>Add to Resources</button>
        </div>
        <div className={styles.right}>IMAGE</div>
      </div>
    </div>
  );
};

export default Resources;
