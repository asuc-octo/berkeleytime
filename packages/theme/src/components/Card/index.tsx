import { ComponentPropsWithRef } from "react";

import { Box, BoxProps, Flex, FlexProps } from "@radix-ui/themes";
import classNames from "classnames";

import { Color } from "../ThemeProvider";
import styles from "./Card.module.scss";

interface RootProps {
  active?: boolean;
  disabled?: boolean;
  hoverColorChange?: boolean;
}

function Root({
  children,
  active,
  disabled,
  hoverColorChange = true,
  className,
  ...props
}: RootProps & ComponentPropsWithRef<"div">) {
  return (
    <div
      className={classNames(styles.root, className, {
        [styles.active]: active,
        [styles.disabled]: disabled,
        [styles.hoverColorChange]: hoverColorChange,
      })}
      {...props}
    >
      {children}
    </div>
  );
}

function Body({ children, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div className={styles.body} {...props}>
      {children}
    </div>
  );
}

function LeftBorder({
  color,
  ...props
}: ComponentPropsWithRef<"div"> & { color: Color }) {
  return (
    <div
      className={styles.border}
      style={{
        backgroundColor: `var(--${color}-500)`,
      }}
      {...props}
    />
  );
}

function Heading({ children, ...props }: ComponentPropsWithRef<"p">) {
  return (
    <p className={styles.heading} {...props}>
      {children}
    </p>
  );
}
function Description({
  children,
  className,
  wrapDescription,
  ...props
}: ComponentPropsWithRef<"p"> & { wrapDescription?: boolean }) {
  return (
    <p
      className={classNames(styles.description, className, {
        [styles.wrapDescription]: wrapDescription,
      })}
      {...props}
    >
      {children}
    </p>
  );
}

function Footer({ children, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div className={styles.footer} {...props}>
      {children}
    </div>
  );
}

function Actions({ children, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <Flex className={styles.column} {...props} direction="row" gap="3">
      {children}
    </Flex>
  );
}

function ActionIcon({
  children,
  onClick,
  isDelete,
  ...props
}: { isDelete?: true } & ComponentPropsWithRef<"div">) {
  return (
    <div
      className={isDelete ? styles.deleteIcon : styles.icon}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

function RootColumn({
  style,
  ...props
}: RootProps & ComponentPropsWithRef<"div">) {
  return <Root style={{ flexDirection: "column", ...style }} {...props} />;
}

function ColumnHeader({ children, style, ...props }: FlexProps) {
  return (
    <Flex
      direction="row"
      style={{
        width: "100%",
        overflow: "hidden",
        flexShrink: "0",
        ...style,
      }}
      {...props}
    >
      {children}
    </Flex>
  );
}

function ColumnBody({ ...props }: BoxProps) {
  return <Box p="4" width="100%" {...props} />;
}

export const Card = {
  Root,
  RootColumn,
  Body,
  LeftBorder,
  Heading,
  Description,
  Footer,
  Actions,
  ActionIcon,
  ColumnHeader,
  ColumnBody,
};
