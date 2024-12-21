import { ReactNode, forwardRef } from "react";

import {
  Arrow,
  Content,
  Portal,
  Root,
  TooltipContentProps,
  TooltipTriggerProps,
  Trigger,
} from "@radix-ui/react-tooltip";

import styles from "./Tooltip.module.scss";

export interface TooltipProps {
  children: ReactNode;
  content: string;
}

export const Tooltip = forwardRef<
  HTMLButtonElement,
  TooltipProps &
    Pick<TooltipContentProps, "sideOffset" | "side" | "collisionPadding"> &
    Omit<TooltipTriggerProps, "asChild">
>(
  (
    {
      content,
      children,
      sideOffset = 8,
      collisionPadding = 8,
      side = "bottom",
      ...props
    },
    ref
  ) => {
    return (
      <Root disableHoverableContent>
        <Trigger {...props} ref={ref} asChild>
          {children}
        </Trigger>
        <Portal>
          <Content
            asChild
            side={side}
            sideOffset={sideOffset}
            collisionPadding={collisionPadding}
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
);
