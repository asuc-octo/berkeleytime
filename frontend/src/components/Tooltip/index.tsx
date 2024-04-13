import { ReactNode } from "react";

import {
  Arrow,
  Content,
  Portal,
  Root,
  TooltipContentProps,
  Trigger,
} from "@radix-ui/react-tooltip";

import styles from "./Tooltip.module.scss";

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export default function Tooltip({
  content,
  children,
  sideOffset = 8,
  collisionPadding = 8,
  side = "bottom",
  ...props
}: TooltipContentProps & Omit<TooltipProps, "asChild">) {
  return (
    <Root disableHoverableContent>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content
          asChild
          side={side}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          {...props}
        >
          <div className={styles.content}>
            <Arrow className={styles.arrow} />
            {content}
          </div>
        </Content>
      </Portal>
    </Root>
  );
}
