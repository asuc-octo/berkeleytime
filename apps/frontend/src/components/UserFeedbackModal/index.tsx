import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@repo/theme";
import { useState } from "react";
import { AttendanceForm } from "./AttendanceForm";
import { RatingsForm } from "./RatingForm";
import styles from "./UserFeedbackModal.module.scss";
import { Semester } from "@/lib/api/terms";

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
  onSubmit: (ratings: any, termInfo: { semester: Semester; year: number }) => Promise<void>;
  initialRatings?: {
    usefulness: number;
    difficulty: number;
    workload: number;
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
    workload: 0
  }
}: UserFeedbackModalProps) {
  const defaultTerm = `${currentClass.semester} ${currentClass.year}`;
  const [selectedTerm, setSelectedTerm] = useState(
    availableTerms.length > 0 ? availableTerms[0].value : defaultTerm
  );

  // Lifted `ratings` state to ensure it can be accessed in `handleSubmit`
  const [ratings, setRatings] = useState(initialRatings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log ratings before submission to verify the latest state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting ratings:", ratings); // Verify latest state before submission
    setIsSubmitting(true);

    try {
      const selectedTermInfo = availableTerms.find(t => t.value === selectedTerm);
      if (!selectedTermInfo) throw new Error('Invalid term selected');

      await onSubmit(ratings, {
        semester: selectedTermInfo.semester,
        year: selectedTermInfo.year
      });

      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error submitting ratings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.modal}>
          <Dialog.Close className={styles.closeButton}>✕</Dialog.Close>
          <div className={styles.modalHeader}>
            <Dialog.Title className={styles.modalTitle}>{title}</Dialog.Title>
            <div className={styles.subtitleRow}>
              <Dialog.Description className={styles.modalSubtitle}>
                {currentClass.subject} {currentClass.courseNumber} {currentClass.number}
              </Dialog.Description>
              <select 
                className={styles.termDropdown}
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                {availableTerms.map((term) => (
                  <option 
                    key={`${term.semester}-${term.year}`}
                    value={term.value}
                  >
                    {term.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.modalContent}>
              <div className={styles.combinedForm}>
                {/* Pass `ratings` and `setRatings` to `RatingsForm` */}
                <RatingsForm 
                  ratings={ratings} 
                  setRatings={setRatings} 
                />
                <AttendanceForm currentClass={currentClass} />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Dialog.Close asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </Dialog.Close>
              <Button type="submit">
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default UserFeedbackModal;
