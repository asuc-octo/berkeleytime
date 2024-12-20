import { useEffect, useMemo, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import ReactSelect from "react-select";

import { MetricName } from "@repo/shared";
import { Button } from "@repo/theme";

import { useReadTerms } from "@/hooks/api";
import { Semester, TemporalPosition } from "@/lib/api/terms";

import { MetricData, UserRating, toMetricData } from "../helper/metricsUtil";
import { AttendanceForm, RatingsForm } from "./FeedbackForm";
import { SubmitRatingPopup } from "./FeedbackPopups";
import styles from "./UserFeedbackModal.module.scss";
import ratingStyles from "../Ratings.module.scss";
import { termSelectStyle } from "../helper/termSelectStyle";

const RequiredAsterisk = () => <span style={{ color: "red" }}>*</span>;

interface Term {
  value: string;
  label: string;
  semester: Semester;
  year: number;
}

interface UserFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentClass: {
    subject: string;
    courseNumber: string;
    number: string;
    semester: string;
    year: number;
  };
  availableTerms: Term[];
  onSubmit: (
    metricData: MetricData,
    termInfo: { semester: Semester; year: number }
  ) => Promise<void>;
  initialUserClass: UserRating | null;
}

export function UserFeedbackModal({
  isOpen,
  onClose,
  title,
  currentClass,
  availableTerms = [],
  onSubmit,
  initialUserClass,
}: UserFeedbackModalProps) {
  const { data: termsData } = useReadTerms();
  const initialMetricData = useMemo(
    () =>
      toMetricData(
        initialUserClass?.metrics ??
          Object.values(MetricName).map((metric) => {
            return { metricName: metric, value: undefined };
          })
      ),
    [initialUserClass?.metrics]
  );

  const initialTermValue = useMemo(
    () =>
      initialUserClass?.semester && initialUserClass?.year
        ? `${initialUserClass.semester} ${initialUserClass.year}`
        : null,
    [initialUserClass?.semester, initialUserClass?.year]
  );

  const [selectedTerm, setSelectedTerm] = useState<string | null>(
    initialTermValue
  );
  const [metricData, setMetricData] = useState(initialMetricData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialUserClass?.semester && initialUserClass?.year)
      setSelectedTerm(`${initialUserClass.semester} ${initialUserClass.year}`);
    if (initialUserClass?.metrics)
      setMetricData(toMetricData(initialUserClass.metrics));
  }, [initialUserClass]);

  const hasChanges = useMemo(() => {
    const termChanged = selectedTerm !== initialTermValue;
    const metricsChanged = Object.values(MetricName).some(
      (metric) => metricData[metric] !== initialMetricData[metric]
    );
    return termChanged || metricsChanged;
  }, [selectedTerm, metricData, initialTermValue, initialMetricData]);

  const isFormValid = useMemo(() => {
    const isTermValid = selectedTerm && selectedTerm.length > 0;
    const areRatingsValid =
      typeof metricData[MetricName.Usefulness] === "number" &&
      typeof metricData[MetricName.Difficulty] === "number" &&
      typeof metricData[MetricName.Workload] === "number";
    return isTermValid && areRatingsValid && hasChanges;
  }, [selectedTerm, metricData, hasChanges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const selectedTermInfo = availableTerms.find(
        (t) => t.value === selectedTerm
      );
      if (!selectedTermInfo) throw new Error("Invalid term selected");

      await onSubmit(metricData, {
        semester: selectedTermInfo.semester,
        year: selectedTermInfo.year,
      });

      onClose();
      setIsSubmitRatingPopupOpen(true);
    } catch (error) {
      console.error("Error submitting ratings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const [isSubmitRatingPopupOpen, setIsSubmitRatingPopupOpen] = useState(false);

  // Filter for past terms
  const pastTerms = useMemo(() => {
    if (!termsData) return availableTerms;

    const termPositions = termsData.reduce(
      (acc: Record<string, TemporalPosition>, term: any) => {
        acc[`${term.semester} ${term.year}`] = term.temporalPosition;
        return acc;
      },
      {}
    );

    return availableTerms.filter((term) => {
      const position = termPositions[term.value];
      return position === TemporalPosition.Past;
    });
  }, [availableTerms, termsData]);

  const handleClose = () => {
    // Reset form state to initial values when closing
    setMetricData(initialMetricData);
    setSelectedTerm(initialTermValue);
    onClose();
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleClose}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.modal}>
            <Dialog.Close className={styles.closeButton}>✕</Dialog.Close>
            <div className={styles.modalHeader}>
              <Dialog.Title className={styles.modalTitle}>{title}</Dialog.Title>
              <div className={styles.subtitleRow}>
                <Dialog.Description className={styles.modalSubtitle}>
                  {currentClass.subject} {currentClass.courseNumber}
                </Dialog.Description>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalContent}>
                <div className={styles.combinedForm}>
                  <div className={styles.ratingSection}>
                    <div className={styles.formGroup}>
                      <h3>
                        1. What semester did you take this course?{" "}
                        <RequiredAsterisk />
                      </h3>
                      <div
                        style={{
                          width: "230px",
                          marginLeft: "18px",
                        }}
                      >
                        <ReactSelect
                          id="term-selection"
                          options={pastTerms.map((term) => ({
                            value: term.value,
                            label: term.label,
                          }))}
                          value={
                            selectedTerm
                              ? pastTerms.find(
                                  (term) => term.value === selectedTerm
                                )
                              : null
                          }
                          onChange={(selectedOption: any) =>
                            setSelectedTerm(selectedOption?.value || null)
                          }
                          placeholder="Select semester"
                          isClearable={true}
                          classNamePrefix="select"
                          className={ratingStyles.termSelect}
                          styles={termSelectStyle}
                        />
                      </div>
                    </div>

                    <RatingsForm
                      metricData={metricData}
                      setMetricData={setMetricData}
                    />
                    <AttendanceForm
                      metricData={metricData}
                      setMetricData={setMetricData}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <Dialog.Close asChild>
                  <Button
                    className={styles.cancelButton}
                    type="button"
                  >
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  className={`${styles.submitButton} ${isFormValid ? styles.valid : styles.invalid}`}
                  type="submit"
                  onClick={(e: any) => {
                    e.preventDefault();
                    if (isFormValid) {
                      handleSubmit(e);
                    }
                  }}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : !hasChanges && initialUserClass
                      ? "No Changes"
                      : initialUserClass
                        ? "Submit Edit"
                        : "Submit Rating"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <SubmitRatingPopup
        isOpen={isSubmitRatingPopupOpen}
        onClose={() => setIsSubmitRatingPopupOpen(false)}
      />
    </>
  );
}

export default UserFeedbackModal;
