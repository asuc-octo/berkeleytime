import { ReactNode } from "react";

import { Xmark } from "iconoir-react";

import { IconButton } from "@repo/theme";

import styles from "./DeleteContainer.module.scss";

interface DeleteContainerProps {
  children: ReactNode;
  onClick: () => void;
}

export default function DeleteContainer({
  children,
  onClick,
}: DeleteContainerProps) {
  return (
    <div className={styles.root}>
      {children}
      <IconButton className={styles.delete} onClick={onClick}>
        <Xmark />
      </IconButton>
    </div>
  );
}
