import { useState } from "react";

import { Button, Dialog } from "@repo/theme";

import styles from "./CommentForm.module.scss";

interface CommentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
  courseName: string;
}

export default function CommentForm({
  isOpen,
  onClose,
  onSubmit,
  courseName,
}: CommentFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 2000;
  const isValid = text.trim().length > 0 && text.length <= maxLength;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText(""); // Reset form on success
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setText("");
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Card>
          <Dialog.Header
            title={`Add Comment for ${courseName}`}
            hasCloseButton
          />

          <Dialog.Body className={styles.body}>
            <form onSubmit={handleSubmit}>
              <textarea
                className={styles.textarea}
                placeholder="Share your thoughts about this course..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={maxLength}
                rows={6}
                autoFocus
                disabled={isSubmitting}
              />
              <div className={styles.charCount}>
                {text.length}/{maxLength} characters
              </div>
            </form>
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Comment"}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
