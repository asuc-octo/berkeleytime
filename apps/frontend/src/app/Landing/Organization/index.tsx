import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Flex,
} from "@repo/theme";

import Footer from "@/components/Footer";

import asucSeal from "../assets/asuc-seal.png";
import plus from "../assets/plus.svg";
import styles from "./Organization.module.scss";

function Trigger({ children }: { children: string }) {
  return (
    <AccordionTrigger className={styles.trigger}>
      {children}
      <img src={plus} alt="" className={styles.plus} />
    </AccordionTrigger>
  );
}

export default function Organization() {
  return (
    <Flex direction="column" className={styles.root}>
      <div className={styles.involved}>
        <h2 className={styles.involvedTitle}>Get Involved</h2>
        <Accordion type="single" collapsible className={styles.accordion}>
          <AccordionItem value="join">
            <Trigger>Join Our Team</Trigger>
            <AccordionContent>
              Ship real features that shape how thousands of students plan their
              academic journey. We're always looking for developers, designers,
              researchers, and marketers.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="contribute">
            <Trigger>Contribute Code</Trigger>
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
            <Trigger>Leave Us Feedback</Trigger>
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
      <Flex direction="column" align="center" className={styles.memorial}>
        <h2 className={styles.memorialTitle}>
          In Memory Of Courtney Brousseau
        </h2>
        <p className={styles.memorialText}>
          Berkeley Alum, ASUC Student Union Board of Directors Chair, ASUC Chief
          Communications Officer, and Berkeley Mobile Product Manager
        </p>
      </Flex>
      <Flex direction="column" align="center" className={styles.supporters}>
        <h2 className={styles.supportersTitle}>Supported By</h2>
        <div className={styles.supportersLogos}>
          <a
            href="https://asuc.org/"
            className={styles.sponsorLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.asucSeal}>
              <img src={asucSeal} alt="ASUC" />
            </span>
          </a>
          <a
            href="https://www.ocf.berkeley.edu/"
            className={styles.sponsorLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hosted by the OCF"
          >
            <span className={styles.ocfLogo} />
          </a>
          <a
            href="https://studenttech.berkeley.edu/student-technology-fund-2014-2021"
            className={styles.sponsorLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Berkeley Student Technology Fund"
          >
            <span className={styles.techFundLogo} />
          </a>
          <a
            href="https://berkeleytime.com/go/about-mechanize"
            className={styles.sponsorLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/mechanize-dark-mode.png"
              alt="Mechanize"
              className={styles.mechanizeLogo}
            />
          </a>
        </div>
      </Flex>
      <div className={styles.footer}>
        <Footer />
      </div>
    </Flex>
  );
}
