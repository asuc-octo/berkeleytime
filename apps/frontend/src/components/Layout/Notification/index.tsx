import { useState } from "react";

import { Xmark } from "iconoir-react";
import { Link } from "react-router-dom";

import { Button } from "@repo/theme";

import styles from "./Notification.module.scss";

export default function Notification() {
  const [open, setOpen] = useState(
    () => localStorage.getItem("showNotification") !== "1"
  );

  const handleClose = () => {
    localStorage.setItem("showNotification", "1");
    setOpen(false);
  };

  if (!open) return null;

  // TODO: pull text and link from an API
  const text =
    "We are looking to improve our features to redesign the enrollment experience!";
  const link = "https://bit.ly/berkeleytime-enrollment";

  return (
    <a className={styles.root}>
      <div className={styles.group}>
        <p className={styles.text}>{text}</p>
        <Link to={link}>
          <Button variant="solid">Fill out our survey</Button>
        </Link>
      </div>
      <Xmark
        className={styles.close}
        height={24}
        width={24}
        onClick={handleClose}
      />
    </a>
  );
}
