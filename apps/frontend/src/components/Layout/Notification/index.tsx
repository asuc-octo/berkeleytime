import { useEffect, useState } from "react";

import { Xmark } from "iconoir-react";
import { Link } from "react-router-dom";

import { Button } from "@repo/theme";

import styles from "./Notification.module.scss";

interface NotifacationProps {
  mainText: string;
  buttonText: string;
  link: string;
}

export default function Notification() {
  const [open, setOpen] = useState(
    () => localStorage.getItem("showNotification") !== "1"
  );
  const [notificationData, setNotificationData] = useState<NotifacationProps>({
    mainText: "",
    buttonText: "",
    link: "",
  });

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const response = await fetch("https://localhost:8080"); // Dummy API
        const data = await response.json();
        setNotificationData({
          mainText: data.mainText,
          buttonText: data.buttonText,
          link: data.link,
        });
      } catch (error) {
        console.error("Error fetching notification data:", error);
        setNotificationData({
          mainText: "",
          buttonText: "",
          link: "",
        });
      }
    };

    fetchNotificationData();
  }, []);

  const handleClose = () => {
    localStorage.setItem("showNotification", "1");
    setOpen(false);
  };

  if (!open || !notificationData.mainText) return null;

  return (
    <a className={styles.root}>
      <div className={styles.group}>
        <p className={styles.text}>{notificationData.mainText}</p>
        {notificationData.buttonText && notificationData.link && (
          <Link to={notificationData.link}>
            <Button variant="solid">{notificationData.buttonText}</Button>
          </Link>
        )}
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
