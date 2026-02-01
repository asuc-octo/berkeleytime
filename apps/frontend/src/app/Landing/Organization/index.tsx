import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Container,
  Flex,
} from "@repo/theme";

import Footer from "@/components/Footer";

import styles from "./Organization.module.scss";

export default function Organization() {
  return (
    <Flex direction="column" className={styles.root} pt="9">
      <Container className={styles.wrapper}>
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
      </Container>
      <Container className={styles.wrapper}>
        <div className={styles.getInvolvedBox}>
          <div className={styles.getInvolvedTitle}>
            <h2 className={styles.heading}>Sponsors</h2>
            <p className={styles.description}>
              Thank you to the folks that help the Berkeleytime team continue to
              provide this service free-of-charge to students!
            </p>
          </div>
          <div className={styles.sponsorsLogos}>
            {/* TODO: Uncomment when Mechanize partnership kicks in
            <a
              href="https://mechanize.work/"
              className={styles.sponsorLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                style={{
                  background: "#ffffff",
                  padding: "0 12px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  height: "60px",
                }}
              >
                <img
                  src="/images/mechanize.png"
                  alt="Mechanize"
                  style={{ height: "45px", width: "auto", display: "block" }}
                />
                <span
                  style={{ color: "#000", fontWeight: 500, fontSize: "18px" }}
                >
                  Mechanize, Inc.
                </span>
              </div>
            </a>
            */}
            <a
              href="https://www.ocf.berkeley.edu/"
              className={styles.sponsorLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                style={{
                  background: "#ffffff",
                  padding: "0 8px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  height: "60px",
                }}
              >
                <img
                  src="/images/ocf.svg"
                  alt="OCF"
                  style={{ height: "45px", width: "auto", display: "block" }}
                />
              </div>
            </a>
            <a
              href="https://asuc.org/"
              className={styles.sponsorLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/asuc.png"
                alt="ASUC"
                className={styles.asucLogo}
              />
            </a>
          </div>
        </div>
      </Container>
      <Container className={styles.sponsorsSection}>
        <div className={styles.sponsorsContent}>
          <h2 className={styles.sponsorsTitle}>
            In Memory Of Courtney Brousseau
          </h2>
          <p className={styles.sponsorsText}>
            Berkeley Alum, ASUC Student Union Board of Directors Chair, ASUC
            Chief Communications Officer, and Berkeley Mobile Product Manager
          </p>
        </div>
      </Container>
      <Footer />
    </Flex>
  );
}
