import { useState } from "react";

import { Copy, EditPencil, Plus, Trash, Xmark } from "iconoir-react";
import Markdown from "react-markdown";

import { Button, Dialog, Flex, Input, PillSwitcher, Switch } from "@repo/theme";

import { BASE } from "@/helper";

import {
  useAllBanners,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "../../hooks/api/banner";
import { useCourseLookup } from "../../hooks/api/course";
import {
  useAllRouteRedirects,
  useCreateRouteRedirect,
  useDeleteRouteRedirect,
  useUpdateRouteRedirect,
} from "../../hooks/api/route-redirect";
import {
  useAllTargetedMessages,
  useCreateTargetedMessage,
  useDeleteTargetedMessage,
  useUpdateTargetedMessage,
} from "../../hooks/api/targeted-message";
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
import type {
  CreateTargetedMessageInput,
  TargetedMessage,
  TargetedMessageCourse,
  UpdateTargetedMessageInput,
} from "../../lib/api/targeted-message";
import styles from "./Outreach.module.scss";

const TABS = [
  { value: "banners", label: "Banners" },
  { value: "redirects", label: "Redirects" },
  { value: "targeted", label: "Targeted" },
];

interface FormCourse {
  subject: string;
  courseNumber: string;
  courseId: string;
}

interface TargetedMessageFormData {
  title: string;
  description: string;
  link: string;
  linkText: string;
  clickEventLogging: boolean;
  targetCourses: FormCourse[];
}

const initialTargetedMessageFormData: TargetedMessageFormData = {
  title: "",
  description: "",
  link: "",
  linkText: "",
  clickEventLogging: false,
  targetCourses: [],
};

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

  // Targeted message state
  const { data: targetedMessages, loading: targetedLoading } =
    useAllTargetedMessages();
  const { createTargetedMessage, loading: creatingTargeted } =
    useCreateTargetedMessage();
  const { updateTargetedMessage, loading: updatingTargeted } =
    useUpdateTargetedMessage();
  const { deleteTargetedMessage, loading: deletingTargeted } =
    useDeleteTargetedMessage();
  const [isTargetedModalOpen, setIsTargetedModalOpen] = useState(false);
  const [editingTargeted, setEditingTargeted] =
    useState<TargetedMessage | null>(null);
  const [targetedFormData, setTargetedFormData] =
    useState<TargetedMessageFormData>(initialTargetedMessageFormData);
  const [courseInput, setCourseInput] = useState("");
  const [courseError, setCourseError] = useState<string | null>(null);
  const { lookupCourse } = useCourseLookup();

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

  // Targeted message handlers
  const handleOpenCreateTargeted = () => {
    setEditingTargeted(null);
    setTargetedFormData(initialTargetedMessageFormData);
    setCourseInput("");
    setIsTargetedModalOpen(true);
  };

  const handleOpenEditTargeted = (message: TargetedMessage) => {
    setEditingTargeted(message);
    setTargetedFormData({
      title: message.title,
      description: message.description || "",
      link: message.link || "",
      linkText: message.linkText || "",
      clickEventLogging: message.clickEventLogging,
      targetCourses: message.targetCourses.map((c) => ({
        ...c,
      })),
    });
    setCourseInput("");
    setIsTargetedModalOpen(true);
  };

  const handleCloseTargetedModal = () => {
    setIsTargetedModalOpen(false);
    setEditingTargeted(null);
    setTargetedFormData(initialTargetedMessageFormData);
    setCourseInput("");
    setCourseError(null);
  };

  const [addingCourse, setAddingCourse] = useState(false);

  const handleAddCourse = async () => {
    const raw = courseInput.trim();
    if (!raw) return;

    setCourseError(null);

    // Parse "SUBJECT NUMBER" format, e.g. "COMPSCI 162" or "MATH 53"
    const match = raw.match(/^([A-Za-z\s]+?)\s+(\S+)$/);
    if (!match) {
      setCourseError("Enter a course as SUBJECT NUMBER (e.g., COMPSCI 162)");
      return;
    }

    const subject = match[1].trim().replace(/\s+/g, " ").toUpperCase();
    const courseNumber = match[2].toUpperCase();

    // Deduplicate
    const alreadyAdded = targetedFormData.targetCourses.some(
      (c) => c.subject === subject && c.courseNumber === courseNumber
    );
    if (alreadyAdded) {
      return;
    }

    setAddingCourse(true);
    try {
      const course = await lookupCourse(subject, courseNumber);

      if (!course) {
        setCourseError("Course not found. Check subject and number.");
        return;
      }

      setTargetedFormData((prev) => ({
        ...prev,
        targetCourses: (() => {
          const nextCourse = {
            subject: course.subject,
            courseNumber: course.number,
            courseId: course.courseId,
          };
          const alreadyAddedLatest = prev.targetCourses.some(
            (existing) =>
              existing.courseId === nextCourse.courseId ||
              (existing.subject === nextCourse.subject &&
                existing.courseNumber === nextCourse.courseNumber)
          );
          if (alreadyAddedLatest) {
            return prev.targetCourses;
          }
          return [...prev.targetCourses, nextCourse];
        })(),
      }));
      setCourseInput("");
    } finally {
      setAddingCourse(false);
    }
  };

  const handleRemoveCourse = (index: number) => {
    setTargetedFormData({
      ...targetedFormData,
      targetCourses: targetedFormData.targetCourses.filter(
        (_, i) => i !== index
      ),
    });
  };

  const handleSubmitTargeted = async () => {
    if (
      !targetedFormData.title.trim() ||
      targetedFormData.targetCourses.length === 0
    ) {
      return;
    }

    const resolvedCourses: TargetedMessageCourse[] =
      targetedFormData.targetCourses.map(
        ({ courseId, subject, courseNumber }) => ({
          courseId,
          subject,
          courseNumber,
        })
      );

    try {
      if (editingTargeted) {
        const input: UpdateTargetedMessageInput = {
          title: targetedFormData.title.trim(),
          description: targetedFormData.description.trim() || null,
          link: targetedFormData.link.trim() || null,
          linkText: targetedFormData.linkText.trim() || null,
          clickEventLogging: targetedFormData.clickEventLogging,
          targetCourses: resolvedCourses,
        };
        await updateTargetedMessage(editingTargeted.id, input);
      } else {
        const input: CreateTargetedMessageInput = {
          title: targetedFormData.title.trim(),
          description: targetedFormData.description.trim() || null,
          link: targetedFormData.link.trim() || null,
          linkText: targetedFormData.linkText.trim() || null,
          clickEventLogging: targetedFormData.clickEventLogging,
          targetCourses: resolvedCourses,
        };
        await createTargetedMessage(input);
      }
      handleCloseTargetedModal();
    } catch (error) {
      console.error("Error saving targeted message:", error);
    }
  };

  const hasValidTargetedForm =
    targetedFormData.title.trim().length > 0 &&
    targetedFormData.targetCourses.length > 0;

  const handleDeleteTargeted = async (messageId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this targeted message? This action cannot be undone."
      )
    ) {
      try {
        await deleteTargetedMessage(messageId);
      } catch (error) {
        console.error("Error deleting targeted message:", error);
      }
    }
  };

  const handleToggleTargetedVisibility = async (
    messageId: string,
    currentVisible: boolean
  ) => {
    const action = currentVisible ? "hide" : "show";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this targeted message? ${
        currentVisible
          ? "It will no longer appear on targeted course pages."
          : "It will start appearing on targeted course pages immediately."
      }`
    );

    if (!confirmed) return;

    try {
      await updateTargetedMessage(messageId, { visible: !currentVisible });
    } catch (error) {
      console.error("Error toggling targeted message visibility:", error);
    }
  };

  const getCreateButtonLabel = () => {
    switch (activeTab) {
      case "banners":
        return "Create Banner";
      case "redirects":
        return "Create Redirect";
      case "targeted":
        return "Create Targeted Message";
      default:
        return "Create";
    }
  };

  const getCreateButtonHandler = () => {
    switch (activeTab) {
      case "banners":
        return handleOpenCreateBanner;
      case "redirects":
        return handleOpenCreateRedirect;
      case "targeted":
        return handleOpenCreateTargeted;
      default:
        return handleOpenCreateBanner;
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
        <Button variant="primary" onClick={getCreateButtonHandler()}>
          <Plus width={16} height={16} />
          {getCreateButtonLabel()}
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

      {activeTab === "targeted" && (
        <>
          {targetedLoading ? (
            <div className={styles.emptyState}>
              Loading targeted messages...
            </div>
          ) : targetedMessages.length === 0 ? (
            <div className={styles.emptyState}>
              No targeted messages found. Create one to get started.
            </div>
          ) : (
            <div className={styles.list}>
              {targetedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.card} ${!message.visible ? styles.hidden : ""}`}
                >
                  <div className={styles.cardHeader}>
                    {message.clickEventLogging ? (
                      <div className={styles.badgeRow}>
                        <span className={styles.badge}>
                          Click Event Logging
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className={styles.visibilityToggle}>
                      <Switch
                        checked={message.visible}
                        onCheckedChange={() =>
                          handleToggleTargetedVisibility(
                            message.id,
                            message.visible
                          )
                        }
                        disabled={updatingTargeted}
                      />
                      <span>{message.visible ? "Visible" : "Hidden"}</span>
                    </div>
                  </div>
                  <p className={styles.bannerText}>
                    <strong>{message.title}</strong>
                    {message.description && (
                      <>
                        {" — "}
                        {message.description}
                      </>
                    )}
                    {message.link && (
                      <>
                        {" "}
                        <a
                          href={message.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.linkText}
                        >
                          {message.linkText || "Learn more"} →
                        </a>
                      </>
                    )}
                  </p>
                  {message.link && (
                    <a
                      href={message.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fullLink}
                    >
                      {message.link}
                    </a>
                  )}
                  <div className={styles.targetCoursesRow}>
                    <span className={styles.targetLabel}>Courses:</span>
                    <div className={styles.courseTagList}>
                      {message.targetCourses.map((course, i) => (
                        <span key={i} className={styles.courseTag}>
                          {course.subject} {course.courseNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.cardBottom}>
                    <span className={styles.meta}>
                      {message.clickCount} click
                      {message.clickCount !== 1 ? "s" : ""} •{" "}
                      {message.dismissCount} dismissal
                      {message.dismissCount !== 1 ? "s" : ""} • Created:{" "}
                      {(() => {
                        if (!message.createdAt) return "Invalid Date";
                        const date = new Date(message.createdAt);
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
                        onClick={() => handleOpenEditTargeted(message)}
                      >
                        <EditPencil width={14} height={14} />
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleDeleteTargeted(message.id)}
                        disabled={deletingTargeted}
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

      {/* Targeted Message Modal */}
      <Dialog.Root
        open={isTargetedModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseTargetedModal();
        }}
      >
        <Dialog.Card>
          <Dialog.Header
            title={
              editingTargeted
                ? "Edit Targeted Message"
                : "Create Targeted Message"
            }
            hasCloseButton
          />
          <Dialog.Body>
            <Flex direction="column" gap="16px">
              <div className={styles.formField}>
                <label className={styles.formLabel}>Title *</label>
                <Input
                  type="text"
                  placeholder="e.g., Taking this class?"
                  value={targetedFormData.title}
                  onChange={(e) =>
                    setTargetedFormData({
                      ...targetedFormData,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Description</label>
                <Input
                  type="text"
                  placeholder="e.g., Interested in ML research? Apply to our lab!"
                  value={targetedFormData.description}
                  onChange={(e) =>
                    setTargetedFormData({
                      ...targetedFormData,
                      description: e.target.value,
                    })
                  }
                />
                <p className={styles.formHint}>
                  Optional body text shown below the title.
                </p>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Link URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={targetedFormData.link}
                  onChange={(e) =>
                    setTargetedFormData({
                      ...targetedFormData,
                      link: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Link Text</label>
                <Input
                  type="text"
                  placeholder="e.g., Apply now"
                  value={targetedFormData.linkText}
                  onChange={(e) =>
                    setTargetedFormData({
                      ...targetedFormData,
                      linkText: e.target.value,
                    })
                  }
                />
                <p className={styles.formHint}>
                  Defaults to "Learn more" if left blank.
                </p>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Target Courses *</label>
                <div className={styles.courseInputRow}>
                  <Input
                    type="text"
                    placeholder="e.g., COMPSCI 162"
                    value={courseInput}
                    onChange={(e) => {
                      setCourseInput(e.target.value);
                      if (courseError) setCourseError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCourse();
                      }
                    }}
                    className={styles.courseInputField}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleAddCourse}
                    disabled={addingCourse || !courseInput.trim()}
                  >
                    {addingCourse ? "..." : "Add"}
                  </Button>
                </div>
                {courseError && (
                  <p className={styles.courseErrorHint}>{courseError}</p>
                )}
                <p className={styles.formHint}>
                  Type a course as "SUBJECT NUMBER" (e.g., COMPSCI 162) and
                  press Enter or click Add.
                </p>
                {targetedFormData.targetCourses.length > 0 && (
                  <div className={styles.courseTagContainer}>
                    {targetedFormData.targetCourses.map((course, i) => (
                      <span key={i} className={styles.editableCourseTag}>
                        {course.subject} {course.courseNumber}
                        <button
                          className={styles.removeCourseTag}
                          onClick={() => handleRemoveCourse(i)}
                        >
                          <Xmark width={12} height={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formField}>
                <Flex align="center" gap="8px">
                  <Switch
                    checked={targetedFormData.clickEventLogging}
                    onCheckedChange={(checked) =>
                      setTargetedFormData({
                        ...targetedFormData,
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
            <Button variant="secondary" onClick={handleCloseTargetedModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitTargeted}
              disabled={
                !hasValidTargetedForm || creatingTargeted || updatingTargeted
              }
            >
              {editingTargeted ? "Save Changes" : "Create Targeted Message"}
            </Button>
          </Dialog.Footer>
        </Dialog.Card>
      </Dialog.Root>

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
