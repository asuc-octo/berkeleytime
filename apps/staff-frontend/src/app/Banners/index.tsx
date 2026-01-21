import { useState } from "react";

import { EditPencil, Plus, Trash } from "iconoir-react";

import { Button, Checkbox, Dialog, Flex, Input } from "@repo/theme";

import {
  useAllBanners,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "../../hooks/api/banner";
import {
  Banner,
  CreateBannerInput,
  UpdateBannerInput,
} from "../../lib/api/banner";
import styles from "./Banners.module.scss";

interface BannerFormData {
  text: string;
  link: string;
  linkText: string;
  persistent: boolean;
  reappearing: boolean;
}

const initialFormData: BannerFormData = {
  text: "",
  link: "",
  linkText: "",
  persistent: false,
  reappearing: false,
};

export default function Banners() {
  const { data: banners, loading } = useAllBanners();
  const { createBanner, loading: creating } = useCreateBanner();
  const { updateBanner, loading: updating } = useUpdateBanner();
  const { deleteBanner, loading: deleting } = useDeleteBanner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(initialFormData);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      text: banner.text,
      link: banner.link || "",
      linkText: banner.linkText || "",
      persistent: banner.persistent,
      reappearing: banner.reappearing,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    if (!formData.text.trim()) {
      return;
    }

    try {
      if (editingBanner) {
        const input: UpdateBannerInput = {
          text: formData.text.trim(),
          link: formData.link.trim() || null,
          linkText: formData.linkText.trim() || null,
          persistent: formData.persistent,
          reappearing: formData.reappearing,
        };
        await updateBanner(editingBanner.id, input);
      } else {
        const input: CreateBannerInput = {
          text: formData.text.trim(),
          link: formData.link.trim() || null,
          linkText: formData.linkText.trim() || null,
          persistent: formData.persistent,
          reappearing: formData.reappearing,
        };
        await createBanner(input);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving banner:", error);
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this banner? This action cannot be undone."
      )
    ) {
      try {
        await deleteBanner(bannerId);
      } catch (error) {
        console.error("Error deleting banner:", error);
      }
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Banners</h1>
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus width={16} height={16} />
          Create Banner
        </Button>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className={styles.emptyState}>
          No banners found. Create one to get started.
        </div>
      ) : (
        <div className={styles.bannerList}>
          {banners.map((banner) => (
            <div key={banner.id} className={styles.bannerCard}>
              <div className={styles.bannerContent}>
                <div className={styles.bannerHeader}>
                  <p
                    className={styles.bannerText}
                    dangerouslySetInnerHTML={{ __html: banner.text }}
                  />
                  {banner.persistent && (
                    <span className={styles.persistentBadge}>Persistent</span>
                  )}
                  {banner.reappearing && (
                    <span className={styles.persistentBadge}>Reappearing</span>
                  )}
                </div>
                {banner.link && (
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.bannerLink}
                  >
                    {(banner.linkText || "Open link") + " →"}
                  </a>
                )}
                <div className={styles.bannerMeta}>
                  {banner.clickCount} click{banner.clickCount !== 1 ? "s" : ""}{" "}
                  • Created:{" "}
                  {(() => {
                    if (!banner.createdAt) return "Invalid Date";
                    const date = new Date(banner.createdAt);
                    return !isNaN(date.getTime())
                      ? date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Invalid Date";
                  })()}
                  {banner.updatedAt &&
                    banner.updatedAt !== banner.createdAt &&
                    (() => {
                      const date = new Date(banner.updatedAt);
                      return !isNaN(date.getTime()) ? (
                        <>
                          {" "}
                          • Updated:{" "}
                          {date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </>
                      ) : null;
                    })()}
                </div>
              </div>
              <div className={styles.bannerActions}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleOpenEdit(banner)}
                >
                  <EditPencil width={14} height={14} />
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleDelete(banner.id)}
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
            title={editingBanner ? "Edit Banner" : "Create Banner"}
            hasCloseButton
          />
          <Dialog.Body>
            <Flex direction="column" gap="16px">
              <div className={styles.formField}>
                <label className={styles.formLabel}>Banner Text *</label>
                <Input
                  type="text"
                  placeholder="e.g., Looking for Spring 2026 data? Check out the new Berkeleytime"
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                />
                <p className={styles.formHint}>
                  You can use HTML tags like &lt;i&gt; for italics
                </p>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Link URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Link Text (optional)</label>
                <Input
                  type="text"
                  placeholder="e.g., Open Beta"
                  value={formData.linkText}
                  onChange={(e) =>
                    setFormData({ ...formData, linkText: e.target.value })
                  }
                />
                <p className={styles.formHint}>
                  Text to display on the button. Defaults to “Open link” if left
                  blank.
                </p>
              </div>

              <div className={styles.formField}>
                <Flex align="center" gap="8px">
                  <Checkbox
                    checked={formData.persistent}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        persistent: checked === true,
                      })
                    }
                  />
                  <label className={styles.checkboxLabel}>Persistent</label>
                </Flex>
                <p className={styles.formHint}>
                  Persistent banners always show and cannot be permanently
                  dismissed. Non-persistent banners are hidden after the user
                  dismisses them.
                </p>
              </div>

              <div className={styles.formField}>
                <Flex align="center" gap="8px">
                  <Checkbox
                    checked={formData.reappearing}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        reappearing: checked === true,
                      })
                    }
                  />
                  <label className={styles.checkboxLabel}>Reappearing</label>
                </Flex>
                <p className={styles.formHint}>
                  Reappearing banners can be dismissed per tab, but will
                  reappear when the user opens a new tab. Uses session storage
                  instead of local storage.
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
              disabled={!formData.text.trim() || creating || updating}
            >
              {editingBanner ? "Save Changes" : "Create Banner"}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Root>
    </div>
  );
}
