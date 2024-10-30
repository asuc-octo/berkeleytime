import React from 'react';
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@repo/theme";
import { RatingsForm } from './RatingForm';
import { AttendanceForm } from './AttendanceForm';
import { ClassData } from './types';
import styles from './UserFeedbackModal.module.scss';

interface UserFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  currentClass: ClassData;
}

export function UserFeedbackModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  currentClass 
}: UserFeedbackModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.modal}>
        <Dialog.Close className={styles.closeButton}>
            ✕
          </Dialog.Close>
          <div className={styles.modalHeader}>
            <Dialog.Title className={styles.modalTitle}>
              {title}
            </Dialog.Title>
            <div className={styles.subtitleRow}>
              <Dialog.Description className={styles.modalSubtitle}>
                {currentClass.subject} {currentClass.courseNumber}
              </Dialog.Description>
              <select className={styles.termDropdown}>
                <option>Fall 2024</option>
                <option>testing</option>
                <option>testing</option>
                {/* figure out to get all da terms */}
                {/* change ratings based on terms */} 
              </select>
            </div>
          </div>

          <div className={styles.modalContent}>
            <div className={styles.combinedForm}>
              <RatingsForm currentClass={currentClass} />
              <AttendanceForm currentClass={currentClass} />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <Dialog.Close asChild>
              <Button variant="secondary">Cancel</Button>
            </Dialog.Close>
            <Button type="submit">Submit</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
