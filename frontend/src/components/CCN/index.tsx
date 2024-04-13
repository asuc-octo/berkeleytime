import { useRef } from "react";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Hashtag } from "iconoir-react";

import styles from "./CCN.module.scss";

interface CCNProps {
  ccn: string;
}

export default function CCN({ ccn }: CCNProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  const copy = () => {
    if (!textRef.current) return;

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(textRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);

    navigator.clipboard.writeText(ccn);
  };

  return (
    <Tooltip.Root disableHoverableContent>
      <Tooltip.Trigger asChild>
        <div className={styles.trigger} onClick={copy}>
          <Hashtag />
          <span ref={textRef}>{ccn}</span>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          asChild
          side="bottom"
          sideOffset={8}
          collisionPadding={8}
        >
          <div className={styles.content}>
            <Tooltip.Arrow className={styles.arrow} />
            <p className={styles.title}>Class number</p>
            <p className={styles.description}>
              Use this number to search for and enroll in this class within the
              CalCentral Enrollment Center.
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
