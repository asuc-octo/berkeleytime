import { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import ReactSelect from "react-select";

import { Button } from "@repo/theme";

import { Semester } from "@/lib/api/terms";

import { MetricData, MetricName } from "../Class/Ratings/helper/metricsUtil";
import { AttendanceForm } from "./AttendanceForm";
import ConfirmationPopup from "./ConfirmationForm";
import { RatingsForm } from "./RatingForm";
// Import the ConfirmationPopup component
import styles from "./UserFeedbackModal.module.scss";

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
  initialMetricData = {
    [MetricName.Usefulness]: undefined,
    [MetricName.Difficulty]: undefined,
    [MetricName.Workload]: undefined,
    [MetricName.Attendance]: undefined,
    [MetricName.Recording]: undefined,
  },
}: UserFeedbackModalProps) {
  const defaultTerm = `${currentClass.semester} ${currentClass.year}`;
  const [selectedTerm, setSelectedTerm] = useState(
    availableTerms.length > 0 ? availableTerms[0].value : defaultTerm
  );

  const [metricData, setMetricData] = useState(initialMetricData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Close the original modal and open the confirmation popup
      onClose(); // Close the original modal
      setIsConfirmationPopupOpen(true); // Open the confirmation popup
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
                      <p>1. What semester did you take this course?</p>
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
                          setSelectedTerm(selectedOption?.value || defaultTerm)
                        }
                        classNamePrefix="termDropdown"
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

              <div className={styles.modalFooter}>
                <Dialog.Close asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button type="submit">
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Render the ConfirmationPopup */}
      <ConfirmationPopup
        isOpen={isConfirmationPopupOpen}
        onClose={() => setIsConfirmationPopupOpen(false)}
      />
    </>
  );
}

export default UserFeedbackModal;