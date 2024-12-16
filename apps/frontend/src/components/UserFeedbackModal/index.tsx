import { useEffect, useMemo, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import ReactSelect from "react-select";

import { MetricName } from "@repo/shared";
import { Button } from "@repo/theme";

import { useReadTerms } from "@/hooks/api";
import { Semester, TemporalPosition } from "@/lib/api/terms";

import {
  MetricData,
  UserRating,
  toMetricData,
} from "../Class/Ratings/helper/metricsUtil";
import { AttendanceForm } from "./AttendanceForm";
import SubmissionPopup from "./SubmissionPopup";
import { RatingsForm } from "./RatingForm";
import styles from "./UserFeedbackModal.module.scss";

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

  const [selectedTerm, setSelectedTerm] = useState<string | null>(initialTermValue);
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
    console.log("Submitting ratings:", metricData);
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
      setIsSubmissionPopupOpen(true);
    } catch (error) {
      console.error("Error submitting ratings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const [isSubmissionPopupOpen, setIsSubmissionPopupOpen] = useState(false);

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
                          width: "231px",
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
                          className={styles.termSelect}
                          styles={{
                            control: (base) => ({
                              ...base,
                              backgroundColor: "var(--foreground-color)",
                              borderColor: "var(--border-color)",
                              minHeight: "38px",
                              maxHeight: "38px",
                              width: "100%",
                              "&:hover": {
                                borderColor: "var(--blue-400)",
                              },
                              "&:focus-within": {
                                borderColor: "var(--blue-500)",
                                boxShadow: "0 0 0 2px var(--blue-200)",
                              },
                            }),
                            menu: (base) => ({
                              ...base,
                              backgroundColor: "var(--foreground-color)",
                              border: "1px solid var(--border-color)",
                              width: "100%",
                            }),
                            option: (base, state) => ({
                              ...base,
                              backgroundColor: state.isFocused
                                ? "var(--hover-color)"
                                : "var(--foreground-color)",
                              color: "var(--paragraph-color)",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "var(--blue-500)",
                                color: "white",
                              },
                            }),
                            singleValue: (base) => ({
                              ...base,
                              color: "var(--paragraph-color)",
                            }),
                            input: (base) => ({
                              ...base,
                              color: "var(--paragraph-color)",
                              maxWidth: "150px",
                              overflow: "hidden",
                              marginRight: "8px",
                            }),
                            dropdownIndicator: (base) => ({
                              ...base,
                              color: "var(--paragraph-color)",
                            }),
                            placeholder: (base) => ({
                              ...base,
                              color: "var(--paragraph-color)",
                              userSelect: "none",
                            }),
                          }}
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
                    style={{
                      border: "none",
                      color: "var(--paragraph-color)",
                      transition: "color 0.2s ease",
                      background: "none",
                    }}
                    onMouseOver={(e: any) => {
                      e.currentTarget.style.color = "var(--heading-color)";
                    }}
                    onMouseOut={(e: any) => {
                      e.currentTarget.style.color = "var(--paragraph-color)";
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  style={{
                    background: isFormValid
                      ? "var(--blue-500)"
                      : "var(--foreground-color)",
                    color: isFormValid
                      ? "white"
                      : "color-mix(in srgb, var(--paragraph-color) 50%, transparent)",
                    transition: "background-color 0.2s ease",
                    cursor: isFormValid ? "pointer" : "default",
                  }}
                  onMouseOver={(e: any) => {
                    if (isFormValid) {
                      e.currentTarget.style.backgroundColor = "#2563EB";
                    }
                  }}
                  onMouseOut={(e: any) => {
                    if (isFormValid) {
                      e.currentTarget.style.backgroundColor = "var(--blue-500)";
                    }
                  }}
                  type="submit"
                  //disabled={!isFormValid || isSubmitting}
                  onClick={(e: any) => {
                    e.preventDefault();
                    console.log("Button clicked", {
                      isFormValid,
                      isSubmitting,
                    });
                    if (isFormValid) {
                      handleSubmit(e);
                    }
                  }}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : (!hasChanges && initialUserClass)
                      ? "No Changes Made"
                      : initialUserClass
                        ? "Submit Edit"
                        : "Submit Rating"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <SubmissionPopup
        isOpen={isSubmissionPopupOpen}
        onClose={() => setIsSubmissionPopupOpen(false)}
      />
    </>
  );
}

export default UserFeedbackModal;
