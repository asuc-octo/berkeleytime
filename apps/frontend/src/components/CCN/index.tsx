import { MouseEvent, useRef, useState } from "react";

import { ClipboardCheck, Hashtag, PasteClipboard } from "iconoir-react";
import { Tooltip } from "radix-ui";

import styles from "./CCN.module.scss";

interface CCNProps {
  sectionId: string;
  tooltip?: false;
}

export default function CCN({ sectionId, tooltip }: CCNProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  const [over, setOver] = useState(false);
  const [copied, setCopied] = useState(false);

  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (!textRef.current) return;

    if (timeoutId) clearTimeout(timeoutId);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(textRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);

    navigator.clipboard.writeText(sectionId);

    setCopied(true);

    const _timeoutId = setTimeout(() => setCopied(false), 1000);
    setTimeoutId(_timeoutId);
  };

  return (
    <Tooltip.Root disableHoverableContent open={tooltip}>
      <Tooltip.Trigger asChild>
        <div
          className={styles.trigger}
          onClick={handleClick}
          onMouseEnter={() => setOver(true)}
          onMouseLeave={() => setOver(false)}
        >
          {copied ? (
            <ClipboardCheck />
          ) : over ? (
            <PasteClipboard />
          ) : (
            <Hashtag />
          )}
          <span ref={textRef}>{sectionId}</span>
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
            <p className={styles.title}>Class Number</p>
            <p className={styles.description}>
              Use this number to search for and enroll in this class within the
              CalCentral Enrollment Center
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
