import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/theme";

import Footer from "@/components/Footer";

import styles from "./Landing.module.scss";

// Get upcoming semester (what students are likely registering for)
const getUpcomingSemester = () => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const year = now.getFullYear();

  // Nov-Dec: Spring of next year, Jan-Apr: Fall of same year, May-Oct: Spring of next year
  if (month >= 10) return { year: year + 1, semester: "Spring" }; // Nov-Dec -> Spring next year
  if (month <= 3) return { year, semester: "Fall" }; // Jan-Apr -> Fall same year
  return { year: year + 1, semester: "Spring" }; // May-Oct -> Spring next year
};

const Landing = () => {
  const { year, semester } = getUpcomingSemester();
  const defaultClassUrl = `/catalog/${year}/${semester}/COMPSCI/61A/001?embed=true`;

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <div className={styles.headerDots} />
            <h1 className={styles.previewTitle}>
              Berkeley's largest course discovery platform. Built and run by
              students, for students.
            </h1>
          </div>
          <div className={styles.previewWrapper}>
            <div className={styles.previewBackground}>
              <div className={styles.gradientLayer1} />
              <div className={styles.gradientLayer2} />
            </div>
            <div className={styles.previewContainer}>
              <div className={styles.titleBar}>
                <div className={styles.trafficLights}>
                  <span className={styles.trafficLight} data-color="red" />
                  <span className={styles.trafficLight} data-color="yellow" />
                  <span className={styles.trafficLight} data-color="green" />
                </div>
              </div>
              <div className={styles.iframeWrapper}>
                <iframe
                  src={defaultClassUrl}
                  className={styles.previewIframe}
                  title="Catalog Preview"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.getInvolvedBox}>
          <div className={styles.getInvolvedTitle}>
            <h2 className={styles.getInvolvedCardTitle}>Get Involved</h2>
            <p className={styles.getInvolvedDescription}>
              Over 20,000 students use Berkeleytime every semester. Help us make
              course planning a little easier for everyone.
            </p>
          </div>
          <Accordion type="single" collapsible className={styles.accordion}>
            <AccordionItem value="join">
              <AccordionTrigger>Join The Team</AccordionTrigger>
              <AccordionContent>
                Ship real features that shape how thousands of students plan
                their academic journey. We’re always looking for developers,
                designers, researchers, and marketers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="contribute">
              <AccordionTrigger>Contribute Code</AccordionTrigger>
              <AccordionContent>
                Berkeleytime is a completely open-source project. Check out our
                repository and contribute at{" "}
                <a href="https://github.com/asuc-octo/berkeleytime">
                  github.com/asuc-octo/berkeleytime
                </a>
                .
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feedback">
              <AccordionTrigger>Provide Feedback</AccordionTrigger>
              <AccordionContent>
                Spotted a bug or have a quick suggestion?{" "}
                <a
                  href="https://forms.gle/zeAUQAHrMcrRJyhK6"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Fill out this form
                </a>
                . Interested in beta testing new features? Reach out at{" "}
                <a href="mailto:octo.berkeleytime@asuc.org">
                  octo.berkeleytime@asuc.org
                </a>
                .
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className={styles.footerSpacer} />
      <Footer />
    </div>
  );
};

export default Landing;
