import { useState } from "react";

import { Copy, EditPencil, Plus, Trash } from "iconoir-react";
import Markdown from "react-markdown";

import { Button, Dialog, Flex, Input, PillSwitcher, Switch } from "@repo/theme";

import { BASE } from "@/helper";

import {
  useAllBanners,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "../../hooks/api/banner";
import {
  useAllRouteRedirects,
  useCreateRouteRedirect,
  useDeleteRouteRedirect,
  useUpdateRouteRedirect,
} from "../../hooks/api/route-redirect";
import {
  Banner,
  CreateBannerInput,
  UpdateBannerInput,
} from "../../lib/api/banner";
import {
  CreateRouteRedirectInput,
  RouteRedirect,
  UpdateRouteRedirectInput,
} from "../../lib/api/route-redirect";
import styles from "./Outreach.module.scss";

const TABS = [
  { value: "banners", label: "Banners" },
  { value: "redirects", label: "Redirects" },
];

interface BannerFormData {
  text: string;
  link: string;
  linkText: string;
  persistent: boolean;
  reappearing: boolean;
  clickEventLogging: boolean;
}

interface RedirectFormData {
  fromPath: string;
  toPath: string;
  clickEventLogging: boolean;
}

const initialBannerFormData: BannerFormData = {
  text: "",
  link: "",
  linkText: "",
  persistent: false,
  reappearing: false,
  clickEventLogging: false,
};

const initialRedirectFormData: RedirectFormData = {
  fromPath: "",
  toPath: "",
  clickEventLogging: false,
};

export default function Outreach() {
  const [activeTab, setActiveTab] = useState("banners");

  // Banner state
  const { data: banners, loading: bannersLoading } = useAllBanners();
  const { createBanner, loading: creatingBanner } = useCreateBanner();
  const { updateBanner, loading: updatingBanner } = useUpdateBanner();
  const { deleteBanner, loading: deletingBanner } = useDeleteBanner();
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerFormData, setBannerFormData] = useState<BannerFormData>(
    initialBannerFormData
  );

  // Redirect state
  const { data: redirects, loading: redirectsLoading } = useAllRouteRedirects();
  const { createRouteRedirect, loading: creatingRedirect } =
    useCreateRouteRedirect();
  const { updateRouteRedirect, loading: updatingRedirect } =
    useUpdateRouteRedirect();
  const { deleteRouteRedirect, loading: deletingRedirect } =
    useDeleteRouteRedirect();
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<RouteRedirect | null>(
    null
  );
  const [redirectFormData, setRedirectFormData] = useState<RedirectFormData>(
    initialRedirectFormData
  );

  // Banner handlers
  const handleOpenCreateBanner = () => {
    setEditingBanner(null);
    setBannerFormData(initialBannerFormData);
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerFormData({
      text: banner.text,
      link: banner.link || "",
      linkText: banner.linkText || "",
      persistent: banner.persistent,
      reappearing: banner.reappearing,
      clickEventLogging: banner.clickEventLogging,
    });
    setIsBannerModalOpen(true);
  };

  const handleCloseBannerModal = () => {
    setIsBannerModalOpen(false);
    setEditingBanner(null);
    setBannerFormData(initialBannerFormData);
  };

  const handleSubmitBanner = async () => {
    if (!bannerFormData.text.trim()) return;

    try {
      if (editingBanner) {
        const input: UpdateBannerInput = {
          text: bannerFormData.text.trim(),
          link: bannerFormData.link.trim() || null,
          linkText: bannerFormData.linkText.trim() || null,
          persistent: bannerFormData.persistent,
          reappearing: bannerFormData.reappearing,
          clickEventLogging: bannerFormData.clickEventLogging,
        };
        await updateBanner(editingBanner.id, input);
      } else {
        const input: CreateBannerInput = {
          text: bannerFormData.text.trim(),
          link: bannerFormData.link.trim() || null,
          linkText: bannerFormData.linkText.trim() || null,
          persistent: bannerFormData.persistent,
          reappearing: bannerFormData.reappearing,
          clickEventLogging: bannerFormData.clickEventLogging,
        };
        await createBanner(input);
      }
      handleCloseBannerModal();
    } catch (error) {
      console.error("Error saving banner:", error);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
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

  const handleToggleBannerVisibility = async (
    bannerId: string,
    currentVisible: boolean
  ) => {
    const action = currentVisible ? "hide" : "show";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this banner? ${
        currentVisible
          ? "Users will no longer see it."
          : "Users will start seeing it immediately."
      }`
    );

    if (!confirmed) return;

    try {
      await updateBanner(bannerId, { visible: !currentVisible });
    } catch (error) {
      console.error("Error toggling banner visibility:", error);
    }
  };

  // Redirect handlers
  const handleOpenCreateRedirect = () => {
    setEditingRedirect(null);
    setRedirectFormData(initialRedirectFormData);
    setIsRedirectModalOpen(true);
  };

  const handleOpenEditRedirect = (redirect: RouteRedirect) => {
    setEditingRedirect(redirect);
    setRedirectFormData({
      fromPath: redirect.fromPath,
      toPath: redirect.toPath,
      clickEventLogging: redirect.clickEventLogging,
    });
    setIsRedirectModalOpen(true);
  };

  const handleCloseRedirectModal = () => {
    setIsRedirectModalOpen(false);
    setEditingRedirect(null);
    setRedirectFormData(initialRedirectFormData);
  };

  const handleSubmitRedirect = async () => {
    if (!redirectFormData.fromPath.trim() || !redirectFormData.toPath.trim())
      return;

    try {
      if (editingRedirect) {
        const input: UpdateRouteRedirectInput = {
          fromPath: redirectFormData.fromPath.trim(),
          toPath: redirectFormData.toPath.trim(),
          clickEventLogging: redirectFormData.clickEventLogging,
        };
        await updateRouteRedirect(editingRedirect.id, input);
      } else {
        const input: CreateRouteRedirectInput = {
          fromPath: redirectFormData.fromPath.trim(),
          toPath: redirectFormData.toPath.trim(),
          clickEventLogging: redirectFormData.clickEventLogging,
        };
        await createRouteRedirect(input);
      }
      handleCloseRedirectModal();
    } catch (error) {
      console.error("Error saving redirect:", error);
    }
  };

  const handleDeleteRedirect = async (redirectId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this redirect? This action cannot be undone."
      )
    ) {
      try {
        await deleteRouteRedirect(redirectId);
      } catch (error) {
        console.error("Error deleting redirect:", error);
      }
    }
  };

  const getRedirectUrl = (fromPath: string) => {
    const path = fromPath.startsWith("/") ? fromPath.slice(1) : fromPath;
    return `${BASE}/go/${path}`;
  };

  const handleCopyUrl = async (fromPath: string) => {
    const url = getRedirectUrl(fromPath);
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <PillSwitcher
          items={TABS}
          value={activeTab}
          onValueChange={setActiveTab}
        />
        <Button
          variant="primary"
          onClick={
            activeTab === "banners"
              ? handleOpenCreateBanner
              : handleOpenCreateRedirect
          }
        >
          <Plus width={16} height={16} />
          {activeTab === "banners" ? "Create Banner" : "Create Redirect"}
        </Button>
      </div>

      {activeTab === "banners" && (
        <>
          {bannersLoading ? (
            <div className={styles.emptyState}>Loading banners...</div>
          ) : banners.length === 0 ? (
            <div className={styles.emptyState}>
              No banners found. Create one to get started.
            </div>
          ) : (
            <div className={styles.list}>
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`${styles.card} ${!banner.visible ? styles.hidden : ""}`}
                >
                  <div className={styles.cardHeader}>
                    {banner.persistent ||
                    banner.reappearing ||
                    banner.clickEventLogging ? (
                      <div className={styles.badgeRow}>
                        {banner.persistent && (
                          <span className={styles.badge}>Persistent</span>
                        )}
                        {banner.reappearing && (
                          <span className={styles.badge}>Reappearing</span>
                        )}
                        {banner.clickEventLogging && (
                          <span className={styles.badge}>
                            Click Event Logging
                          </span>
                        )}
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className={styles.visibilityToggle}>
                      <Switch
                        checked={banner.visible}
                        onCheckedChange={() =>
                          handleToggleBannerVisibility(
                            banner.id,
                            banner.visible
                          )
                        }
                        disabled={updatingBanner}
                      />
                      <span>{banner.visible ? "Visible" : "Hidden"}</span>
                    </div>
                  </div>
                  <p className={styles.bannerText}>
                    <Markdown
                      allowedElements={["em", "strong", "a", "br"]}
                      unwrapDisallowed
                      components={{
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {banner.text}
                    </Markdown>
                    {banner.link && (
                      <>
                        {" "}
                        <a
                          href={banner.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.linkText}
                        >
                          {banner.linkText || "Open link"} →
                        </a>
                      </>
                    )}
                  </p>
                  {banner.link && (
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fullLink}
                    >
                      {banner.link}
                    </a>
                  )}
                  <div className={styles.cardBottom}>
                    <span className={styles.meta}>
                      {banner.clickCount} click
                      {banner.clickCount !== 1 ? "s" : ""} • {banner.viewCount}{" "}
                      view
                      {banner.viewCount !== 1 ? "s" : ""} •{" "}
                      {banner.dismissCount} dismissal
                      {banner.dismissCount !== 1 ? "s" : ""} • Created:{" "}
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
                    </span>
                    <div className={styles.actions}>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleOpenEditBanner(banner)}
                      >
                        <EditPencil width={14} height={14} />
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleDeleteBanner(banner.id)}
                        disabled={deletingBanner}
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
        </>
      )}

      {activeTab === "redirects" && (
        <>
          {redirectsLoading ? (
            <div className={styles.emptyState}>Loading redirects...</div>
          ) : redirects.length === 0 ? (
            <div className={styles.emptyState}>
              No redirects found. Create one to get started.
            </div>
          ) : (
            <div className={styles.list}>
              {redirects.map((redirect) => (
                <div key={redirect.id} className={styles.card}>
                  {redirect.clickEventLogging && (
                    <div className={styles.badgeRow}>
                      <span className={styles.badge}>Click Event Logging</span>
                    </div>
                  )}
                  <div className={styles.copyRow}>
                    <span className={styles.redirectPath}>
                      /go/{redirect.fromPath.replace(/^\//, "")}
                    </span>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleCopyUrl(redirect.fromPath)}
                    >
                      <Copy width={14} height={14} />
                      Copy link
                    </Button>
                  </div>
                  <a
                    href={redirect.toPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fullLink}
                  >
                    {redirect.toPath}
                  </a>
                  <div className={styles.cardBottom}>
                    <span className={styles.meta}>
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
                    </span>
                    <div className={styles.actions}>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleOpenEditRedirect(redirect)}
                      >
                        <EditPencil width={14} height={14} />
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleDeleteRedirect(redirect.id)}
                        disabled={deletingRedirect}
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
        </>
      )}

      {/* Banner Modal */}
      <Dialog.Root open={isBannerModalOpen} onOpenChange={setIsBannerModalOpen}>
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
                  value={bannerFormData.text}
                  onChange={(e) =>
                    setBannerFormData({
                      ...bannerFormData,
                      text: e.target.value,
                    })
                  }
                />
                <p className={styles.formHint}>
                  Supports Markdown: *italics*, **bold**, [link text](url)
                </p>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Link URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={bannerFormData.link}
                  onChange={(e) =>
                    setBannerFormData({
                      ...bannerFormData,
                      link: e.target.value,
                    })
                  }
                />
                <p className={styles.formHint}>
                  Clicks are always tracked when a link is set.
                </p>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Link Text (optional)</label>
                <Input
                  type="text"
                  placeholder="e.g., Open Beta"
                  value={bannerFormData.linkText}
                  onChange={(e) =>
                    setBannerFormData({
                      ...bannerFormData,
                      linkText: e.target.value,
                    })
                  }
                />
                <p className={styles.formHint}>
                  Text to display on the button. Defaults to "Open link" if left
                  blank.
                </p>
              </div>

              <div className={styles.formField}>
                <Flex align="center" gap="8px">
                  <Switch
                    checked={bannerFormData.persistent}
                    onCheckedChange={(checked) =>
                      setBannerFormData({
                        ...bannerFormData,
                        persistent: checked === true,
                      })
                    }
                  />
                  <label className={styles.toggleLabel}>Persistent</label>
                </Flex>
                <p className={styles.formHint}>
                  Persistent banners always show and cannot be permanently
                  dismissed.
                </p>
              </div>

              <div className={styles.formField}>
                <Flex align="center" gap="8px">
                  <Switch
                    checked={bannerFormData.reappearing}
                    onCheckedChange={(checked) =>
                      setBannerFormData({
                        ...bannerFormData,
                        reappearing: checked === true,
                      })
                    }
                  />
                  <label className={styles.toggleLabel}>Reappearing</label>
                </Flex>
                <p className={styles.formHint}>
                  Reappearing banners will reappear when the user opens a new
                  tab.
                </p>
              </div>

              <div className={styles.formField}>
                <Flex align="center" gap="8px">
                  <Switch
                    checked={bannerFormData.clickEventLogging}
                    onCheckedChange={(checked) =>
                      setBannerFormData({
                        ...bannerFormData,
                        clickEventLogging: checked === true,
                      })
                    }
                  />
                  <label className={styles.toggleLabel}>
                    Click Event Logging
                  </label>
                </Flex>
                <p className={styles.formHint}>
                  When enabled, individual click events are logged with IP hash,
                  user agent, referrer, and timestamps.
                </p>
              </div>
            </Flex>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="secondary" onClick={handleCloseBannerModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitBanner}
              disabled={
                !bannerFormData.text.trim() || creatingBanner || updatingBanner
              }
            >
              {editingBanner ? "Save Changes" : "Create Banner"}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Root>

      {/* Redirect Modal */}
      <Dialog.Root
        open={isRedirectModalOpen}
        onOpenChange={setIsRedirectModalOpen}
      >
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
                  value={redirectFormData.fromPath}
                  onChange={(e) =>
                    setRedirectFormData({
                      ...redirectFormData,
                      fromPath: e.target.value,
                    })
                  }
                />
                <p className={styles.formHint}>
                  The path to redirect from (e.g., /donate). Must start with /.
                </p>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>To URL *</label>
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={redirectFormData.toPath}
                  onChange={(e) =>
                    setRedirectFormData({
                      ...redirectFormData,
                      toPath: e.target.value,
                    })
                  }
                />
                <p className={styles.formHint}>
                  The external URL to redirect to (e.g., https://example.com).
                </p>
              </div>

              <div className={styles.formField}>
                <Flex align="center" gap="8px">
                  <Switch
                    checked={redirectFormData.clickEventLogging}
                    onCheckedChange={(checked) =>
                      setRedirectFormData({
                        ...redirectFormData,
                        clickEventLogging: checked === true,
                      })
                    }
                  />
                  <label className={styles.toggleLabel}>
                    Click Event Logging
                  </label>
                </Flex>
                <p className={styles.formHint}>
                  When enabled, individual click events are logged with IP hash,
                  user agent, referrer, and timestamps.
                </p>
              </div>
            </Flex>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="secondary" onClick={handleCloseRedirectModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitRedirect}
              disabled={
                !redirectFormData.fromPath.trim() ||
                !redirectFormData.toPath.trim() ||
                creatingRedirect ||
                updatingRedirect
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
