import { ComponentPropsWithRef, ReactNode } from "react";

import { Flex } from "@radix-ui/themes";
import { Tooltip as Primitive } from "radix-ui";

import { useStack } from "../../hooks/useStack";
import styles from "./Tooltip.module.scss";

interface Props {
  children: ReactNode;
  card?: ReactNode;
}

interface TooltipCardProps {
  content: ReactNode;
  description?: ReactNode;
  hasArrow?: boolean;
}

export type TooltipProps = Props &
  Omit<Primitive.TooltipTriggerProps, "asChild" | "content"> &
  Pick<
    Primitive.TooltipContentProps,
    "sideOffset" | "side" | "collisionPadding"
  >;

export function TooltipCard({
  content,
  description,
  hasArrow = true,
  ...props
}: Omit<Primitive.TooltipContentProps, keyof TooltipCardProps> &
  TooltipCardProps) {
  const stack = useStack();

  return (
    <div className={styles.card} style={{ zIndex: stack + 1 }} {...props}>
      {hasArrow && <Primitive.Arrow className={styles.arrow} />}
      <Flex direction="column">
        <div className={styles.content}>{content}</div>
        {description && <div className={styles.description}>{description}</div>}
      </Flex>
    </div>
  );
}

export function Tooltip({
  card,
  content,
  description,
  hasArrow = true,
  sideOffset = 8,
  collisionPadding = 8,
  side = "bottom",
  ...props
}: Omit<
  ComponentPropsWithRef<"button">,
  keyof TooltipProps | keyof TooltipCardProps
> &
  TooltipProps &
  TooltipCardProps) {
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
          {card ? (
            card
          ) : (
            <TooltipCard
              content={content}
              description={description}
              hasArrow={hasArrow}
            />
          )}
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
