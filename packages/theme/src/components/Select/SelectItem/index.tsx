import React from "react";

import { Box, Flex } from "@radix-ui/themes";
import classNames from "classnames";

import { Badge } from "../../Badge";
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
    <Box
      className={classNames(styles.root, { [styles.checkbox]: checkboxMulti })}
      data-disabled={disabled}
      data-selected={!checkboxMulti && selected}
    >
      <Flex
        direction="row"
        justify="between"
        align="center"
        width="100%"
        className={classNames({
          [styles.selected]: !checkboxMulti && selected,
        })}
      >
        <Flex direction="row" align="center" gap="8px">
          {checkboxMulti && <Checkbox checked={selected} />}
          {color && !meta ? (
            <Flex direction="row" gap="12px">
              <Badge label={label} color={color} icon={icon} />
            </Flex>
          ) : (
            <Flex direction="row" align="center" gap="12px">
              {icon && icon}
              <span>{label}</span>
            </Flex>
          )}
        </Flex>
        <Flex direction="row" align="center" gap="8px">
          {meta && <span className={styles.meta}>{meta}</span>}
        </Flex>
      </Flex>
    </Box>
  );
}
