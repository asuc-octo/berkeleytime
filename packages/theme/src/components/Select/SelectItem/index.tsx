import React from "react";

import { Box, Flex } from "@radix-ui/themes";
import classNames from "classnames";
import { Check } from "iconoir-react";

import { BadgeLabel } from "../../Badge";
import { Checkbox } from "../../Checkbox";
import { Color } from "../../ThemeProvider";
import styles from "./SelectItem.module.scss";

export interface SelectItemProps {
  label: string;
  meta?: string;
  color?: Color;
  selected?: boolean;
  icon?: React.ReactNode;
  checkboxMulti?: boolean;
  disabled?: boolean;
}

export default function SelectItem({
  label,
  meta,
  color,
  selected = false,
  icon,
  disabled,
  checkboxMulti = false,
}: SelectItemProps) {
  return (
    <Box>
      <Flex
        direction="row"
        justify="between"
        className={classNames(styles.root, { [styles.selected]: selected })}
        data-disabled={disabled}
      >
        <Flex direction="row" align="center" gap="8px">
          {checkboxMulti && (
            <Checkbox checked={selected} style={{ marginRight: "10px" }} />
          )}
          {color && !meta ? (
            <Flex direction="row" gap="12px">
              <BadgeLabel label={label} color={color} icon={icon} />
            </Flex>
          ) : (
            <Flex direction="row" gap="12px">
              {icon && icon}
              <span>
                {label} {meta && <span className={styles.meta}>({meta})</span>}
              </span>
            </Flex>
          )}
        </Flex>
        {selected && !checkboxMulti && <Check />}
      </Flex>
    </Box>
  );
}
