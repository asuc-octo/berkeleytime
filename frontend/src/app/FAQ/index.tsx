import Button from "@/components/Button";
import Footer from "@/components/Footer";

import styles from "./FAQ.module.scss";

const FAQ = () => {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.text}>
          <h1 className={styles.heading}>Frequently Asked Questions</h1>
          <h2 className={styles.description}>
            Answering your most commonly asked questions.
          </h2>
          <Button children={"Contact Us"} className={styles.container} />
        </div>
      </div>
      {/* ADD ACCORDION ITEMS */}
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
};

export default FAQ;
