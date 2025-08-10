import { ComponentPropsWithRef } from "react";

import { Minus, Plus } from "iconoir-react";

import styles from "./Accordion.module.scss";

function Root({ children, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div className={styles.accordion} {...props}>
      {children}
    </div>
  );
}

function Details({ children, ...props }: ComponentPropsWithRef<"details">) {
  return <details {...props}>{children}</details>;
}

function Summary({ children, ...props }: ComponentPropsWithRef<"summary">) {
  return (
    <summary {...props}>
      <h3 className={styles.title}>{children}</h3>
      <Plus height={24} width={24} />
      <Minus height={24} width={24} />
    </summary>
  );
}

function Content({ children, ...props }: ComponentPropsWithRef<"p">) {
  return (
    <p className={styles.content} {...props}>
      {children}
    </p>
  );
}

export const Accordion = {
  Root,
  Details,
  Summary,
  Content,
};
