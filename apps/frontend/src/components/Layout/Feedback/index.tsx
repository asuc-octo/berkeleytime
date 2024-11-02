import { MessageText } from "iconoir-react";

import { Button } from "@repo/theme";

import styles from "./Feedback.module.scss";

export default function Feedback() {
  return (
    <div className={styles.root}>
      <Button
        as="a"
        href="https://forms.gle/zeAUQAHrMcrRJyhK6"
        target="_blank"
        className={styles.button}
        variant="solid"
      >
        <MessageText />
        Provide feedback
      </Button>
    </div>
  );
}
