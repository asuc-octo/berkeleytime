import { ComponentPropsWithRef } from "react";

import { Flex } from "@radix-ui/themes";
import classNames from "classnames";

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
  ...props
}: RootProps & ComponentPropsWithRef<"div">) {
  return (
    <div
      className={classNames(styles.root, {
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

function LeftBorder({ color, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div
      className={styles.border}
      style={{
        backgroundColor: color,
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
function Description({ children, ...props }: ComponentPropsWithRef<"p">) {
  return (
    <p className={styles.description} {...props}>
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

export const Card = {
  Root,
  Body,
  LeftBorder,
  Heading,
  Description,
  Footer,
  Actions,
  ActionIcon,
};
