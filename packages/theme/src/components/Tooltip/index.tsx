import { ReactNode } from "react";

import classNames from "classnames";
import { Tooltip as Primitive } from "radix-ui";

import { useStack } from "../../hooks/useStack";
import { getFloatingLayerZIndex } from "../../layers";
import styles from "./Tooltip.module.scss";

type TooltipSide = Parameters<typeof Primitive.Content>[0]["side"];
type TooltipSideOffset = Parameters<typeof Primitive.Content>[0]["sideOffset"];
type TooltipCollisionPadding = Parameters<
  typeof Primitive.Content
>[0]["collisionPadding"];

interface TooltipProps {
  trigger: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: TooltipSide;
  sideOffset?: TooltipSideOffset;
  collisionPadding?: TooltipCollisionPadding;
  hasArrow?: boolean;
  cardClassName?: string;
}

interface TooltipCardProps {
  content?: ReactNode;
  description?: ReactNode;
  hasArrow?: boolean;
  className?: string;
}

export function TooltipCard({
  content,
  description,
  hasArrow = false,
  className,
}: TooltipCardProps) {
  const stack = useStack();

  // If only content and no description, render without header styling
  if (content && !description) {
    return (
      <div
        className={classNames(styles.card, styles.cardCompact, className)}
        style={{ zIndex: getFloatingLayerZIndex(stack) }}
      >
        {hasArrow && <Primitive.Arrow className={styles.arrow} />}
        <div className={styles.simpleTitle}>{content}</div>
      </div>
    );
  }

  return (
    <div
      className={classNames(styles.card, className)}
      style={{ zIndex: getFloatingLayerZIndex(stack) }}
    >
      {hasArrow && <Primitive.Arrow className={styles.arrow} />}
      {content && <div className={styles.title}>{content}</div>}
      {description && <div className={styles.description}>{description}</div>}
    </div>
  );
}

export function Tooltip({
  trigger,
  title,
  description,
  content,
  open,
  onOpenChange,
  side = "bottom",
  sideOffset = 8,
  collisionPadding = 8,
  hasArrow = false,
  cardClassName,
}: TooltipProps) {
  const stack = useStack();

  return (
    <Primitive.Root
      disableHoverableContent
      open={open}
      onOpenChange={onOpenChange}
    >
      <Primitive.Trigger asChild>{trigger}</Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          asChild
          side={side}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
        >
          <div
            className={classNames(styles.card, cardClassName)}
            style={{ zIndex: getFloatingLayerZIndex(stack) }}
          >
            {hasArrow && <Primitive.Arrow className={styles.arrow} />}
            {content ? (
              <div className={styles.description}>{content}</div>
            ) : title && !description ? (
              <div className={styles.simpleTitle}>{title}</div>
            ) : (
              <>
                {title && <div className={styles.title}>{title}</div>}
                {description && (
                  <div className={styles.description}>{description}</div>
                )}
              </>
            )}
          </div>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
