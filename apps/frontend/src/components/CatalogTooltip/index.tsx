import { ReactNode } from "react";

import classNames from "classnames";
import { Tooltip } from "radix-ui";

import styles from "./CatalogTooltip.module.scss";

type TooltipSide = Parameters<typeof Tooltip.Content>[0]["side"];
type TooltipSideOffset = Parameters<typeof Tooltip.Content>[0]["sideOffset"];
type TooltipCollisionPadding = Parameters<
  typeof Tooltip.Content
>[0]["collisionPadding"];

interface CatalogTooltipProps {
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

export function CatalogTooltip({
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
}: CatalogTooltipProps) {
  return (
    <Tooltip.Root
      disableHoverableContent
      open={open}
      onOpenChange={onOpenChange}
    >
      <Tooltip.Trigger asChild>{trigger}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          asChild
          side={side}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
        >
          <div className={classNames(styles.card, cardClassName)}>
            {hasArrow && <Tooltip.Arrow className={styles.arrow} />}
            {content ? (
              content
            ) : (
              <>
                {title && <p className={styles.title}>{title}</p>}
                {description && (
                  <p className={styles.description}>{description}</p>
                )}
              </>
            )}
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
