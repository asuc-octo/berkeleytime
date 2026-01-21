import { useState } from "react";

import { EditPencil, Plus, Trash } from "iconoir-react";

import { Button, Dialog, Flex, Input } from "@repo/theme";

import {
  useAllRouteRedirects,
  useCreateRouteRedirect,
  useDeleteRouteRedirect,
  useUpdateRouteRedirect,
} from "../../hooks/api/route-redirect";
import {
  CreateRouteRedirectInput,
  RouteRedirect,
  UpdateRouteRedirectInput,
} from "../../lib/api/route-redirect";
import styles from "./RouteRedirects.module.scss";

interface RedirectFormData {
  fromPath: string;
  toPath: string;
}

const initialFormData: RedirectFormData = {
  fromPath: "",
  toPath: "",
};

export default function RouteRedirects() {
  const { data: redirects, loading } = useAllRouteRedirects();
  const { createRouteRedirect, loading: creating } = useCreateRouteRedirect();
  const { updateRouteRedirect, loading: updating } = useUpdateRouteRedirect();
  const { deleteRouteRedirect, loading: deleting } = useDeleteRouteRedirect();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<RouteRedirect | null>(
    null
  );
  const [formData, setFormData] = useState<RedirectFormData>(initialFormData);

  const handleOpenCreate = () => {
    setEditingRedirect(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (redirect: RouteRedirect) => {
    setEditingRedirect(redirect);
    setFormData({
      fromPath: redirect.fromPath,
      toPath: redirect.toPath,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRedirect(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (!formData.fromPath.trim() || !formData.toPath.trim()) {
      return;
    }

    try {
      if (editingRedirect) {
        const input: UpdateRouteRedirectInput = {
          fromPath: formData.fromPath.trim(),
          toPath: formData.toPath.trim(),
        };
        await updateRouteRedirect(editingRedirect.id, input);
      } else {
        const input: CreateRouteRedirectInput = {
          fromPath: formData.fromPath.trim(),
          toPath: formData.toPath.trim(),
        };
        await createRouteRedirect(input);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving route redirect:", error);
    }
  };

  const handleDelete = async (redirectId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this redirect? This action cannot be undone."
      )
    ) {
      try {
        await deleteRouteRedirect(redirectId);
      } catch (error) {
        console.error("Error deleting route redirect:", error);
      }
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Route Redirects</h1>
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus width={16} height={16} />
          Create Redirect
        </Button>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading redirects...</div>
      ) : redirects.length === 0 ? (
        <div className={styles.emptyState}>
          No redirects found. Create one to get started.
        </div>
      ) : (
        <div className={styles.redirectList}>
          {redirects.map((redirect) => (
            <div key={redirect.id} className={styles.redirectCard}>
              <div className={styles.redirectContent}>
                <div className={styles.redirectHeader}>
                  <div className={styles.redirectPaths}>
                    <span className={styles.fromPath}>{redirect.fromPath}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.toPath}>{redirect.toPath}</span>
                  </div>
                </div>
                <div className={styles.redirectMeta}>
                  {redirect.clickCount} click
                  {redirect.clickCount !== 1 ? "s" : ""} • Created:{" "}
                  {(() => {
                    if (!redirect.createdAt) return "Invalid Date";
                    const date = new Date(redirect.createdAt);
                    return !isNaN(date.getTime())
                      ? date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Invalid Date";
                  })()}
                </div>
              </div>
              <div className={styles.redirectActions}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleOpenEdit(redirect)}
                >
                  <EditPencil width={14} height={14} />
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleDelete(redirect.id)}
                  disabled={deleting}
                  isDelete
                >
                  <Trash width={14} height={14} />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Card>
          <Dialog.Header
            title={editingRedirect ? "Edit Redirect" : "Create Redirect"}
            hasCloseButton
          />
          <Dialog.Body>
            <Flex direction="column" gap="16px">
              <div className={styles.formField}>
                <label className={styles.formLabel}>From Path *</label>
                <Input
                  type="text"
                  placeholder="/old-path"
                  value={formData.fromPath}
                  onChange={(e) =>
                    setFormData({ ...formData, fromPath: e.target.value })
                  }
                />
                <p className={styles.formHint}>
                  The path to redirect from (e.g., /old-page). Must start with
                  /.
                </p>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>To URL *</label>
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={formData.toPath}
                  onChange={(e) =>
                    setFormData({ ...formData, toPath: e.target.value })
                  }
                />
                <p className={styles.formHint}>
                  The external URL to redirect to (e.g., https://example.com).
                </p>
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
              disabled={
                !formData.fromPath.trim() ||
                !formData.toPath.trim() ||
                creating ||
                updating
              }
            >
              {editingRedirect ? "Save Changes" : "Create Redirect"}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Root>
    </div>
  );
}
