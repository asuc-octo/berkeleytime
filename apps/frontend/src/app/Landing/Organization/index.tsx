import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Container,
  Flex,
} from "@repo/theme";

import Footer from "@/components/Footer";

import styles from "./Organization.module.scss";

export default function Organization() {
  return (
    <Flex
      direction="column"
      className={styles.root}
      pt="9"
      style={{ backgroundColor: "var(--neutral-900)" }}
    >
      <Container size="1">
        <h3 className={styles.heading}>Get involved</h3>
        <Accordion type="single" collapsible>
          <AccordionItem value="join">
            <AccordionTrigger>Join our team</AccordionTrigger>
            <AccordionContent>
              Become part of a dynamic and innovative group dedicated to helping
              students navigate Berkeley! Roles on the Berkeleytime team include
              backend & frontend development, product design, user research, and
              marketing. We are always looking for passionate and talented
              students.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="contribute">
            <AccordionTrigger>Contribute</AccordionTrigger>
            <AccordionContent>
              Berkeleytime is a completely open-source project. Check out our
              repository:{" "}
              <a href="https://github.com/asuc-octo/berkeleytime">
                https://github.com/asuc-octo/berkeleytime
              </a>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="feedback">
            <AccordionTrigger>Provide feedback</AccordionTrigger>
            <AccordionContent>
              We're always looking for beta testers! Email us at
              octo.berkeleytime@asuc.org if you are interested.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Container>
      <Footer invert />
    </Flex>
  );
}
