import { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import ReactSelect from "react-select";

import { Button } from "@repo/theme";
import ConfirmationPopup from "@/components/UserFeedbackModal/ConfirmationForm";
import { Semester } from "@/lib/api/terms";

import { AttendanceForm } from "./AttendanceForm";
import { RatingsForm } from "./RatingForm";
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
      ratings: any,
      termInfo: { semester: Semester; year: number }
  ) => Promise<void>;
  initialRatings?: {
    usefulness: number | undefined;
    difficulty: number | undefined;
    workload: number | undefined;
  };
}

export function UserFeedbackModal({
                                    isOpen,
                                    onClose,
                                    title,
                                    currentClass,
                                    availableTerms = [],
                                    onSubmit,
                                    initialRatings = {
                                      usefulness: 0,
                                      difficulty: 0,
                                      workload: 0,
                                    },
                                  }: UserFeedbackModalProps) {
  const defaultTerm = `${currentClass.semester} ${currentClass.year}`;
  const [selectedTerm, setSelectedTerm] = useState(
      availableTerms.length > 0 ? availableTerms[0].value : defaultTerm
  );
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);


  // Lifted `ratings` state to ensure it can be accessed in `handleSubmit`
  const [ratings, setRatings] = useState(initialRatings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log ratings before submission to verify the latest state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting ratings:", ratings); // Verify latest state before submission
    setIsSubmitting(true);

    try {
      const selectedTermInfo = availableTerms.find(
          (t) => t.value === selectedTerm
      );
      if (!selectedTermInfo) throw new Error("Invalid term selected");

      // TODO: type safety issue for ratings?
      await onSubmit(ratings, {
        semester: selectedTermInfo.semester,
        year: selectedTermInfo.year,
      });

      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error submitting ratings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                          classNamePrefix="termDropdown" // Prefix for custom styles
                      />
                      {/* <Select.Root
                value={selectedTerm}
                onValueChange={(value) => setSelectedTerm(value)}
              >
                <Select.Trigger className={styles.termDropdown}>
                  <Select.Value />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content>
                    <Select.Viewport>
                      {availableTerms.map((term) => (
                        <Select.Item
                          key={`${term.semester}-${term.year}`}
                          value={term.value}
                        >
                          <Select.ItemText>{term.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root> */}
                    </div>
                  </div>

                  {/* Pass `ratings` and `setRatings` to `RatingsForm` */}
                  <RatingsForm ratings={ratings} setRatings={setRatings} />
                  <AttendanceForm />
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
        <ConfirmationPopup
            isOpen={isConfirmationOpen}
            onClose={() => setConfirmationOpen(false)}
        />
      </>
  );
}

export default UserFeedbackModal;
