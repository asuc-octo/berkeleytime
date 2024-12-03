import { useMemo, useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import ReactSelect from "react-select";

import { MetricName } from "@repo/shared";
import { Button } from "@repo/theme";

import { Semester } from "@/lib/api/terms";

import { MetricData } from "../Class/Ratings/helper/metricsUtil";
import { AttendanceForm } from "./AttendanceForm";
import ConfirmationPopup from "./ConfirmationForm";
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
  initialMetricData: MetricData;
}

export function UserFeedbackModal({
  isOpen,
  onClose,
  title,
  currentClass,
  availableTerms = [],
  onSubmit,
  initialMetricData = Object.fromEntries(
    Object.values(MetricName).map((metric) => [metric, undefined])
  ) as MetricData,
}: UserFeedbackModalProps) {
  const defaultTerm = `${currentClass.semester} ${currentClass.year}`;
  const [selectedTerm, setSelectedTerm] = useState(
    availableTerms.length > 0 ? availableTerms[0].value : defaultTerm
  );
  const [metricData, setMetricData] = useState(initialMetricData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    const isTermValid = selectedTerm && selectedTerm.length > 0;
    const areRatingsValid =
      typeof metricData[MetricName.Usefulness] === "number" &&
      typeof metricData[MetricName.Difficulty] === "number" &&
      typeof metricData[MetricName.Workload] === "number";
    return isTermValid && areRatingsValid;
  }, [selectedTerm, metricData]);

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
      setIsConfirmationPopupOpen(true);
    } catch (error) {
      console.error("Error submitting ratings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const [isConfirmationPopupOpen, setIsConfirmationPopupOpen] = useState(false);

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
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
                          maxWidth: "300px",
                          marginLeft: "18px",
                        }}
                      >
                        <ReactSelect
                          id="term-selection"
                          options={availableTerms.map((term) => ({
                            value: term.value,
                            label: term.label,
                          }))}
                          value={availableTerms.find(
                            (term) => term.value === selectedTerm
                          )}
                          onChange={(selectedOption: any) =>
                            setSelectedTerm(
                              selectedOption?.value || defaultTerm
                            )
                          }
                          classNamePrefix="termDropdown"
                          styles={{
                            control: (base) => ({
                              ...base,
                              backgroundColor: "var(--foreground-color)",
                              maxHeight: "35px",
                              color: "var(--paragraph-color)",
                              fontSize: "14px",
                              fontWeight: "400",
                              borderRadius: "4px",
                              border: "1px solid var(--border-color)",
                              minWidth: "231px",
                            }),
                            menu: (base) => ({
                              ...base,
                              backgroundColor: "var(--foreground-color)",
                              color: "var(--paragraph-color)",
                              fontWeight: "400",
                              fontSize: "14px",
                            }),
                            option: (base) => ({
                              ...base,
                              backgroundColor: "var(--foreground-color)",
                              color: "var(--paragraph-color)",
                              border: "none",
                              fontSize: "14px",
                              "&:hover": {
                                backgroundColor: "var(--blue-500)",
                              },
                            }),
                            singleValue: (base) => ({
                              ...base,
                              color: "var(--paragraph-color)",
                            }),
                            dropdownIndicator: (base) => ({
                              ...base,
                              color: "var(--paragraph-color)",
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
                    background: isFormValid ? "var(--blue-500)" : "#60A5FA",
                    color: "white",
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
                  {isSubmitting ? "Submitting..." : "Submit Rating"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ConfirmationPopup
        isOpen={isConfirmationPopupOpen}
        onClose={() => setIsConfirmationPopupOpen(false)}
      />
    </>
  );
}

export default UserFeedbackModal;
