import React from "react";

import { Box, Flex } from "@radix-ui/themes";
import classNames from "classnames";
import { Check } from "iconoir-react";

import styles from "./SelectItem.module.scss";

export interface SelectItemProps {
  label: string;
  selected?: boolean;
  icon?: React.ReactNode;
  multi?: boolean;
  disabled?: boolean;
}

export default function SelectItem({
  label,
  selected = false,
  icon,
  disabled,
  // multi = false
}: SelectItemProps) {
  return (
    <Box>
      <Flex
        direction="row"
        justify="between"
        className={classNames(styles.root, { [styles.selected]: selected })}
        data-disabled={disabled}
      >
        <Flex direction="row" gap="12px">
          {icon && icon}
          <span>{label}</span>
        </Flex>
        {selected && <Check />}
      </Flex>
    </Box>
  );
}
