import { ComponentPropsWithRef, ReactNode } from "react";

import { Tooltip as Primitive } from "radix-ui";

import { useStack } from "../../hooks/useStack";
import styles from "./Tooltip.module.scss";

interface Props {
  children: ReactNode;
  content: string;
}

export type TooltipProps = Props &
  Omit<Primitive.TooltipTriggerProps, "asChild"> &
  Pick<
    Primitive.TooltipContentProps,
    "sideOffset" | "side" | "collisionPadding"
  >;

export function Tooltip({
  content,
  sideOffset = 8,
  collisionPadding = 8,
  side = "bottom",
  ...props
}: Omit<ComponentPropsWithRef<"button">, keyof TooltipProps> & TooltipProps) {
  const stack = useStack();

  return (
    <Primitive.Root disableHoverableContent>
      <Primitive.Trigger {...props} asChild />
      <Primitive.Portal>
        <Primitive.Content
          asChild
          side={side}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
        >
          <div className={styles.content} style={{ zIndex: stack + 1 }}>
            <Primitive.Arrow className={styles.arrow} />
            {content}
          </div>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
