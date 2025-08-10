import { memo } from "react";

import classNames from "classnames";
import { ArrowRight } from "iconoir-react";

import { Button } from "@repo/theme";

import { signIn } from "@/lib/api";

import { checkConstraint } from "../metricsUtil";
import styles from "./RatingButton.module.scss";

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
      return (
        <Button
          variant="secondary"
          className={classNames(styles.button, { canRate: styles.invalid })}
          onClick={() => onOpenModal(true)}
        >
          {canRate ? "Add a rating" : "Max Ratings Reached"}
        </Button>
      );
    } else {
      const redirectPath = `${window.location.pathname}${checkConstraint(userRatingData, currentClass) ? "?feedbackModal=true" : ""}`;
      return (
        <Button
          variant="secondary"
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
