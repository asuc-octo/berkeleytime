import { Accordion, Container, Flex } from "@repo/theme";

import Footer from "@/components/Footer";

import styles from "./Organization.module.scss";

interface OrganizationProps {
  step: {
    colors: string[];
    gradient?: string[];
    angle?: string;
    image: string;
  };
}

export default function Organization({ step }: OrganizationProps) {
  return (
    <Flex
      direction="column"
      className={styles.root}
      style={{ backgroundColor: step.colors[1] }}
      pt="9"
    >
      <Container size="1">
        <h3 className={styles.heading}>Get involved</h3>
        <Accordion.Root>
          <Accordion.Details>
            <Accordion.Summary>Join our team</Accordion.Summary>
            <Accordion.Content>
              Become part of a dynamic and innovative group dedicated to helping
              students navigate Berkeley! Roles on the Berkeleytime team include
              backend & frontend development, product design, user research, and
              marketing. We are always looking for passionate and talented
              students.
            </Accordion.Content>
          </Accordion.Details>
          <Accordion.Details>
            <Accordion.Summary>Contribute</Accordion.Summary>
            <Accordion.Content>
              Berkeleytime is a completely open-source project. Check out our
              repository:{" "}
              <a href="https://github.com/asuc-octo/berkeleytime">
                https://github.com/asuc-octo/berkeleytime
              </a>
            </Accordion.Content>
          </Accordion.Details>
          <Accordion.Details>
            <Accordion.Summary>Provide feedback</Accordion.Summary>
            <Accordion.Content>
              We're always looking for beta testers! Email us at
              octo.berkeleytime@asuc.org if you are interested.
            </Accordion.Content>
          </Accordion.Details>
        </Accordion.Root>
      </Container>
      <Footer invert />
    </Flex>
  );
}
