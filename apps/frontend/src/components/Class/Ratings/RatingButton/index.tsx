import { memo } from "react";
import { checkConstraint } from "../metricsUtil";
import { Button } from "@repo/theme";
import { signIn } from "@/lib/api";
import { ArrowRight } from "iconoir-react";

import styles from "./RatingButton.module.scss";
import classNames from "classnames";

export const RatingButton = memo(
  ({
    user,
    onOpenModal,
    userRatingData,
    currentClass,
  }: {
    user: any;
    onOpenModal: (open: boolean) => void;
    userRatingData?: any;
    currentClass?: { subject: string; courseNumber: string } | null;
  }) => {
    if (user) {
      const canRate = checkConstraint(userRatingData, currentClass);
      return <Button
          className={classNames(styles.button, {canRate: styles.invalid})}
          onClick={() => onOpenModal(true)}
        >
          { canRate ? "Add a rating" : "Max Ratings Reached" }
        </Button>
    } else {
      const redirectPath = `${window.location.pathname}${checkConstraint(userRatingData, currentClass) ? "?feedbackModal=true" : ""}`;
      return (
        <Button
          onClick={() => signIn(redirectPath)}
          className={styles.ratingButton}
        >
          Sign in to add ratings
          <ArrowRight />
        </Button>
      );
    }
  }
);