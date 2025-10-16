import { ReactNode } from "react";

import { Flex } from "@radix-ui/themes";
import { Tooltip as Primitive } from "radix-ui";

import { ColoredSquare } from "../ColoredSquare";
import { TooltipCard } from "../Tooltip";
import styles from "./HoverCard.module.scss";

interface Props {
  content: ReactNode;
  data?: { label: string; value: string; color?: string; key?: string }[];
}

export type HoverCardProps = Props &
  Omit<Primitive.TooltipTriggerProps, "asChild" | "content"> &
  Pick<
    Primitive.TooltipContentProps,
    "sideOffset" | "side" | "collisionPadding"
  >;

export function HoverCard({ content, data }: HoverCardProps) {
  return (
    <TooltipCard
      hasArrow={false}
      content={content}
      description={
        data && (
          <Flex direction="column" className={styles.dataCont}>
            {data?.map((d, index) => {
              return (
                <Flex
                  key={d.key ?? `${d.label}-${index}`}
                  direction="row"
                  justify="between"
                  className={styles.row}
                >
                  <span>
                    {d.color && (
                      <ColoredSquare
                        size="sm"
                        color={d.color}
                        style={{
                          position: "relative",
                          top: "1.5px",
                          marginRight: "6px",
                        }}
                      />
                    )}
                    {d.label}
                  </span>
                  {d.value}
                </Flex>
              );
            })}
          </Flex>
        )
      }
    />
  );
}
