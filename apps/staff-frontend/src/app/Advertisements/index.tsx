import { useMemo, useState } from "react";

import { EditPencil, Plus, Trash, Xmark } from "iconoir-react";

import { Button, Dialog, Flex, Input } from "@repo/theme";

import {
  useAdTargetPreview,
  useAllAdTargets,
  useCreateAdTarget,
  useDeleteAdTarget,
  useUpdateAdTarget,
} from "../../hooks/api/ad-target";
import { useReadTerms } from "../../hooks/api/terms";
import {
  AdTarget,
  CreateAdTargetInput,
  UpdateAdTargetInput,
} from "../../lib/api/ad-target";
import styles from "./Advertisements.module.scss";

interface AdTargetFormData {
  subjects: string[];
  minCourseNumber: string;
  maxCourseNumber: string;
}

const initialFormData: AdTargetFormData = {
  subjects: [],
  minCourseNumber: "",
  maxCourseNumber: "",
};

export default function Advertisements() {
  const { data: adTargets, loading } = useAllAdTargets();
  const { createAdTarget, loading: creating } = useCreateAdTarget();
  const { updateAdTarget, loading: updating } = useUpdateAdTarget();
  const { deleteAdTarget, loading: deleting } = useDeleteAdTarget();
  const { data: terms } = useReadTerms();
  const {
    runPreview,
    preview,
    loading: previewLoading,
    called: previewCalled,
    resetPreview,
  } = useAdTargetPreview();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<AdTarget | null>(null);
  const [formData, setFormData] = useState<AdTargetFormData>(initialFormData);
  // Temporary input values for array fields
  const [subjectInput, setSubjectInput] = useState("");

  const latestNonSummerTermId = useMemo(() => {
    if (terms.length === 0) return null;

    const nonSummerTerms = terms.filter((term) => term.semester !== "Summer");
    const candidates = nonSummerTerms.length > 0 ? nonSummerTerms : terms;

    const sorted = [...candidates].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    const latest = sorted[0];
    return latest ? `${latest.year}-${latest.semester}` : null;
  }, [terms]);

  const selectedTerm = useMemo(() => {
    if (!latestNonSummerTermId) return null;
    return (
      terms.find(
        (term) => `${term.year}-${term.semester}` === latestNonSummerTermId
      ) ?? null
    );
  }, [terms, latestNonSummerTermId]);

  const handleOpenCreate = () => {
    setEditingTarget(null);
    setFormData(initialFormData);
    setSubjectInput("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (target: AdTarget) => {
    setEditingTarget(target);
    setFormData({
      subjects: target.subjects,
      minCourseNumber: target.minCourseNumber ?? "",
      maxCourseNumber: target.maxCourseNumber ?? "",
    });
    setSubjectInput("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTarget(null);
    setFormData(initialFormData);
    setSubjectInput("");
    resetPreview();
  };

  const handleAddSubject = () => {
    const nextSubjects = subjectInput
      .split(",")
      .map((value) =>
        value.trim().replace(/\s+/g, " ").toUpperCase()
      )
      .filter((value) => value.length > 0);

    if (nextSubjects.length > 0) {
      const merged = new Set([...formData.subjects, ...nextSubjects]);
      setFormData({
        ...formData,
        subjects: Array.from(merged),
      });
    }
    setSubjectInput("");
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((s) => s !== subject),
    });
  };

  const handleSubmit = async () => {
    // At least one targeting criteria must be specified
    const hasSubjects = formData.subjects.length > 0;
    const hasCourseRange = formData.minCourseNumber || formData.maxCourseNumber;

    if (!hasSubjects && !hasCourseRange) {
      return;
    }

    try {
      if (editingTarget) {
        const input: UpdateAdTargetInput = {
          subjects: formData.subjects.length > 0 ? formData.subjects : null,
          minCourseNumber: formData.minCourseNumber || null,
          maxCourseNumber: formData.maxCourseNumber || null,
        };
        await updateAdTarget(editingTarget.id, input);
      } else {
        const input: CreateAdTargetInput = {
          subjects: formData.subjects.length > 0 ? formData.subjects : null,
          minCourseNumber: formData.minCourseNumber || null,
          maxCourseNumber: formData.maxCourseNumber || null,
        };
        await createAdTarget(input);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving ad target:", error);
    }
  };

  const handleRunPreview = () => {
    if (!selectedTerm || !hasValidFormData()) return;

    runPreview({
      variables: {
        year: selectedTerm.year,
        semester: selectedTerm.semester,
        subjects: formData.subjects.length > 0 ? formData.subjects : null,
        minCourseNumber: formData.minCourseNumber || null,
        maxCourseNumber: formData.maxCourseNumber || null,
      },
    });
  };

  const handleDelete = async (adTargetId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this ad target? This action cannot be undone."
      )
    ) {
      try {
        await deleteAdTarget(adTargetId);
      } catch (error) {
        console.error("Error deleting ad target:", error);
      }
    }
  };

  const hasValidFormData = () => {
    return (
      formData.subjects.length > 0 ||
      formData.minCourseNumber ||
      formData.maxCourseNumber
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ad Targets</h1>
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus width={16} height={16} />
          Create Ad Target
        </Button>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading ad targets...</div>
      ) : adTargets.length === 0 ? (
        <div className={styles.emptyState}>
          No ad targets found. Create one to get started.
        </div>
      ) : (
        <div className={styles.list}>
          {adTargets.map((target) => (
            <div key={target.id} className={styles.card}>
              <div className={styles.targetInfo}>
                {target.subjects.length > 0 && (
                  <div className={styles.targetRow}>
                    <span className={styles.targetLabel}>Subjects:</span>
                    <div className={styles.tagList}>
                      {target.subjects.map((subject) => (
                        <span key={subject} className={styles.tag}>
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(target.minCourseNumber || target.maxCourseNumber) && (
                  <div className={styles.targetRow}>
                    <span className={styles.targetLabel}>Course Range:</span>
                    <span className={styles.targetValue}>
                      {target.minCourseNumber || "Any"} -{" "}
                      {target.maxCourseNumber || "Any"}
                    </span>
                  </div>
                )}

              </div>

              <div className={styles.cardBottom}>
                <span className={styles.meta}>
                  Created:{" "}
                  {(() => {
                    if (!target.createdAt) return "Invalid Date";
                    const date = new Date(target.createdAt);
                    return !isNaN(date.getTime())
                      ? date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Invalid Date";
                  })()}
                </span>
                <div className={styles.actions}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleOpenEdit(target)}
                  >
                    <EditPencil width={14} height={14} />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleDelete(target.id)}
                    disabled={deleting}
                    isDelete
                  >
                    <Trash width={14} height={14} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog.Root
        open={isModalOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsModalOpen(true);
            return;
          }
          handleCloseModal();
        }}
      >
        <Dialog.Card>
          <Dialog.Header
            title={editingTarget ? "Edit Ad Target" : "Create Ad Target"}
            hasCloseButton
          />
          <Dialog.Body>
            <Flex direction="column" gap="16px">
              <div className={styles.formField}>
                <label className={styles.formLabel}>Subject Codes</label>
                <div className={styles.tagInput}>
                  <Input
                    type="text"
                    placeholder="e.g., CS, MATH, EECS"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubject();
                      }
                    }}
                    className={styles.tagInputField}
                  />
                  <Button variant="secondary" onClick={handleAddSubject}>
                    Add
                  </Button>
                </div>
                {formData.subjects.length > 0 && (
                  <div className={styles.tagContainer}>
                    {formData.subjects.map((subject) => (
                      <span key={subject} className={styles.editableTag}>
                        {subject}
                        <button
                          className={styles.removeTag}
                          onClick={() => handleRemoveSubject(subject)}
                        >
                          <Xmark width={12} height={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className={styles.formHint}>
                  Exact subject code match only (case-insensitive). Separate
                  with commas.
                </p>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  Course Number Range (optional)
                </label>
                <div className={styles.rangeRow}>
                  <div className={styles.rangeField}>
                    <Input
                      type="text"
                      placeholder="Min (e.g., 1)"
                      value={formData.minCourseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minCourseNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <span className={styles.rangeSeparator}>to</span>
                  <div className={styles.rangeField}>
                    <Input
                      type="text"
                      placeholder="Max (e.g., 199)"
                      value={formData.maxCourseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxCourseNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <p className={styles.formHint}>
                  Matches if any numeric part of the course number falls within
                  the range (e.g., C142 becomes 142, 61A becomes 61).
                </p>
              </div>

              <div className={styles.previewSection}>
                <div className={styles.previewHeader}>
                  <label className={styles.formLabel}>
                    {selectedTerm
                      ? `Preview ${selectedTerm.semester} ${selectedTerm.year} matches`
                      : "Preview matches"}
                  </label>
                  <div className={styles.previewActions}>
                    <Button
                      variant="secondary"
                      onClick={handleRunPreview}
                      disabled={
                        !hasValidFormData() || !selectedTerm || previewLoading
                      }
                    >
                      Preview
                    </Button>
                  </div>
                </div>
                {previewLoading ? (
                  <div className={styles.previewHint}>
                    Loading preview...
                  </div>
                ) : previewCalled ? (
                  preview.length === 0 ? (
                    <div className={styles.previewEmpty}>
                      No matching classes for this term.
                    </div>
                  ) : (
                    <div className={styles.previewList}>
                      {preview.map((item) => (
                        <div
                          key={`${item.courseId}-${item.subject}-${item.courseNumber}-${item.number}`}
                          className={styles.previewItem}
                        >
                          <span className={styles.previewCode}>
                            {item.subject} {item.courseNumber} {item.number}
                          </span>
                          <span className={styles.previewTitle}>
                            {item.title || "Untitled course"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className={styles.previewHint}>
                    Run preview to see matching classes.
                  </div>
                )}
              </div>

            </Flex>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!hasValidFormData() || creating || updating}
            >
              {editingTarget ? "Save Changes" : "Create Ad Target"}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Root>
    </div>
  );
}
