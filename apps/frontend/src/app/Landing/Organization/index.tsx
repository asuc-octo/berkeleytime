import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Flex,
} from "@repo/theme";

import Footer from "@/components/Footer";

import styles from "./Organization.module.scss";

export default function Organization() {
  return (
    <Flex direction="column" className={styles.root} pt="9">
      <div className={styles.wrapper}>
        <div className={styles.getInvolvedBox}>
          <div className={styles.getInvolvedTitle}>
            <h2 className={styles.heading}>Get Involved</h2>
            <p className={styles.description}>
              Over 20,000 students use Berkeleytime every semester. Help us make
              course planning a little easier for everyone.
            </p>
          </div>
          <Accordion type="single" collapsible className={styles.accordion}>
            <AccordionItem value="join">
              <AccordionTrigger>Join The Team</AccordionTrigger>
              <AccordionContent>
                Ship real features that shape how thousands of students plan
                their academic journey. We're always looking for developers,
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
      <Footer />
    </Flex>
  );
}
