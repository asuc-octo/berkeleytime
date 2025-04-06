import { ComponentPropsWithRef } from "react";

import styles from "./Card.module.scss";
import classNames from "classnames";
import { Flex } from "@radix-ui/themes";

interface RootProps {
  active?: boolean;
  hidden?: boolean;
}

function Root({
  children,
  active,
  hidden,
  ...props
}: RootProps & ComponentPropsWithRef<"div">) {
  return (
    <div className={classNames(styles.root,  {
      [styles.active]: active,
      [styles.hidden]: hidden,
    })} {...props}>
      { children }
    </div>
  );
}

function Body({
  children,
  ...props
}: ComponentPropsWithRef<"div">) {
  return <div className={styles.body} {...props}>
      { children }
    </div>
}

function Heading({
  children,
  ...props
}: ComponentPropsWithRef<"p">) {
  return <p className={styles.heading} {...props}>
    { children }
  </p>
}
function Description({
  children,
  ...props
}: ComponentPropsWithRef<"p">) {
  return <p className={styles.description} {...props}>
    { children }
  </p>
}

function Footer({
  children,
  ...props
}: ComponentPropsWithRef<"div">) {
  return <div className={styles.footer} {...props}>
   { children }
  </div>
}

function Actions({
  children,
  ...props
}: ComponentPropsWithRef<"div">) {
  return <Flex className={styles.column} {...props} direction="row" gap="3">
    { children }
  </Flex>
}

function ActionIcon({
  children,
  onClick,
  ...props
}: ComponentPropsWithRef<"div">) {
  return <div className={styles.icon} onClick={onClick} {...props}>
    { children }
  </div>
}

export const Card = {
  Root,
  Body,
  Heading,
  Description,
  Footer,
  Actions,
  ActionIcon
}