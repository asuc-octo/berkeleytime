import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { MetricName, REQUIRED_METRICS } from "@repo/shared";
import { Button, Dialog, Flex, Select } from "@repo/theme";

import { useReadTerms } from "@/hooks/api";
import { IUserRatingClass } from "@/lib/api";
import { Semester, TemporalPosition } from "@/lib/generated/graphql";

import { MetricData, toMetricData } from "../metricsUtil";
import { SubmitRatingPopup } from "./ConfirmationPopups";
import { AttendanceForm, RatingsForm } from "./FeedbackForm";
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
  initialUserClass: IUserRatingClass | null;
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
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    if (
      initialUserClass?.semester &&
      initialUserClass?.year &&
      initialUserClass?.classNumber
    )
      setSelectedTerm(
        `${initialUserClass.semester} ${initialUserClass.year} ${initialUserClass.classNumber}`
      );
    if (initialUserClass?.metrics)
      setMetricData(toMetricData(initialUserClass.metrics));
  }, [initialUserClass]);

  const hasChanges = useMemo(() => {
    const termChanged = selectedTerm !== initialTermValue;
    const metricsChanged = Object.values(MetricName).some(
      (metric) => metricData[metric] !== initialMetricData[metric]
    );
    // Check if all required metrics are filled out
    const allRequiredMetricsFilled = REQUIRED_METRICS.every(
      (metric) => typeof metricData[metric] === "number"
    );
    return allRequiredMetricsFilled && (termChanged || metricsChanged);
  }, [selectedTerm, metricData, initialTermValue, initialMetricData]);

  const isFormValid = useMemo(() => {
    const isTermValid = selectedTerm && selectedTerm.length > 0;
    const areRatingsValid =
      typeof metricData[MetricName.Usefulness] === "number" &&
      typeof metricData[MetricName.Difficulty] === "number" &&
      typeof metricData[MetricName.Workload] === "number";
    return isTermValid && areRatingsValid && hasChanges;
  }, [selectedTerm, metricData, hasChanges]);

  const handleSubmit = async (e: FormEvent) => {
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
      return (
        position === TemporalPosition.Past ||
        TemporalPosition.Current ||
        !position
      );
    });
  }, [availableTerms, termsData]);

  // Auto-select term if only one option is available
  useEffect(() => {
    if (pastTerms.length === 1 && !selectedTerm && !hasAutoSelected.current) {
      setSelectedTerm(pastTerms[0].value);
      hasAutoSelected.current = true;
    }
  }, [pastTerms, selectedTerm]);

  const handleClose = () => {
    // Reset form state to initial values when closing
    setMetricData(initialMetricData);
    setSelectedTerm(null);
    hasAutoSelected.current = false; // Reset the auto-selection flag when closing
    onClose();
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleClose}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Card style={{ width: "auto" }}>
            <Dialog.Header
              title={title}
              subtitle={`${currentClass.subject} ${currentClass.courseNumber}`}
              hasCloseButton
              className={styles.modalHeader}
            />
            <Dialog.Body className={styles.modalBody}>
              <Flex direction="column">
                <div className={styles.formGroup}>
                  <div className={styles.questionPair}>
                    <h3>
                      1. What semester did you take this course?{" "}
                      <RequiredAsterisk />
                    </h3>
                    <div
                      style={{
                        width: 350,
                        margin: "0 auto",
                      }}
                    >
                      <Select
                        options={pastTerms.map((term) => ({
                          value: term.value,
                          label: term.label,
                        }))}
                        value={selectedTerm}
                        onChange={(selectedOption) => {
                          if (Array.isArray(selectedOption))
                            setSelectedTerm(null);
                          else setSelectedTerm(selectedOption || null);
                        }}
                        placeholder="Select semester"
                        clearable={true}
                      />
                    </div>
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
              </Flex>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button
                  className={styles.cancelButton}
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                disabled={!isFormValid}
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
                  : initialUserClass
                    ? "Submit Edit"
                    : "Submit Rating"}
              </Button>
            </Dialog.Footer>
          </Dialog.Card>
        </Dialog.Portal>
      </Dialog.Root>
      <SubmitRatingPopup
        isOpen={isSubmitRatingPopupOpen}
        onClose={() => {
          setIsSubmitRatingPopupOpen(false);
          hasAutoSelected.current = false;
        }}
      />
    </>
  );
}

export default UserFeedbackModal;
