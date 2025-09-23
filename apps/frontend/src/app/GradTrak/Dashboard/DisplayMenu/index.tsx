import { useEffect, useRef, useState } from "react";

import classNames from "classnames";
import {
  ArrowLeft,
  Eye,
  EyeClosed,
  Hashtag,
  Label,
  NavArrowRight,
  Plus,
  Reports,
} from "iconoir-react";

import {
  Badge,
  Color,
  Flex,
  IconButton,
  Switch,
  Text,
  Tooltip,
} from "@repo/theme";

import { GradTrakSettings, ShowSetting } from "../settings";
import styles from "./DisplayMenu.module.scss";

type DisplayMenuProps = {
  onClose: () => void;
  settings: GradTrakSettings;
  onChangeSettings: (patch: Partial<GradTrakSettings>) => void;
};

const SETTING_KEY_TO_DETAILS = {
  [ShowSetting.units]: {
    label: "Units",
    icon: <Hashtag />,
  },
  [ShowSetting.grading]: {
    label: "Grades",
    icon: <Reports />,
  },
  [ShowSetting.labels]: {
    label: "Labels",
    icon: <Label />,
  },
};

export default function DisplayMenu({
  onClose,
  settings,
  onChangeSettings,
}: DisplayMenuProps) {
  const [selectedLayout, setSelectedLayout] = useState<"chart" | "grid">(
    settings?.layout ?? "chart"
  );
  const [activeMenu, setActiveMenu] = useState<"main" | "cardprops">("main");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        onClose?.();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const labels = [
    { name: "University of California", color: "blue" },
    { name: "Breadths", color: "purple" },
    { name: "Decal", color: "teal" },
  ];

  return (
    <div ref={containerRef} className={styles.displayMenu}>
      {activeMenu == "main" ? (
        <>
          <div className={styles.section}>
            <div className={styles.sectionBubble}>
              <div className={styles.sectionTitle}>Layouts</div>
              <div className={styles.layoutOptions}>
                <button
                  className={classNames(styles.layoutOption, {
                    [styles.selected]: selectedLayout === "chart",
                  })}
                  onClick={() => {
                    setSelectedLayout("chart");
                    onChangeSettings({ layout: "chart" });
                  }}
                >
                  <div className={styles.chartIcon}>
                    <div className={styles.bar} style={{ height: "80%" }}></div>
                    <div
                      className={styles.bar}
                      style={{ height: "100%" }}
                    ></div>
                    <div className={styles.bar} style={{ height: "90%" }}></div>
                  </div>
                </button>
                <button
                  className={classNames(styles.layoutOption, {
                    [styles.selected]: selectedLayout === "grid",
                  })}
                  onClick={() => {
                    setSelectedLayout("grid");
                    onChangeSettings({ layout: "grid" });
                  }}
                >
                  <div className={styles.gridIcon}>
                    <div className={styles.gridRow}>
                      <div className={styles.gridItem}></div>
                      <div className={styles.gridItem}></div>
                    </div>
                    <div className={styles.gridRow}>
                      <div className={styles.gridItem}></div>
                      <div className={styles.gridItem}></div>
                    </div>
                    <div className={styles.gridRow}>
                      <div className={styles.gridItem}></div>
                      <div className={styles.gridItem}></div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div
              className={styles.sectionBubbleButton}
              onClick={() => {
                setActiveMenu("cardprops");
              }}
            >
              Card Properties
              <NavArrowRight className={styles.arrow} />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionBubble}>
              <div className={styles.sectionTitle}>Board</div>
              <div className={styles.toggleGroup}>
                <div className={styles.toggleItem}>
                  <Text>Hide completed semesters</Text>
                  <div
                    onClick={() =>
                      onChangeSettings({
                        hideCompletedSemesters:
                          !settings.hideCompletedSemesters,
                      })
                    }
                  >
                    <Switch />
                  </div>
                </div>
                <div className={styles.toggleItem}>
                  <Text>Hide semester status</Text>
                  <div
                    onClick={() =>
                      onChangeSettings?.({
                        hideSemesterStatus: !settings.hideSemesterStatus,
                      })
                    }
                  >
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionBubble}>
              <div className={styles.sectionTitle}>Labels</div>
              <div className={styles.labelsContainer}>
                {labels.map((label) => (
                  <Badge label={label.name} color={Color.amber} />
                ))}
                <IconButton className={{ [styles.addLabel]: true }}>
                  <Plus />
                </IconButton>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.section}>
            <div className={styles.sectionBubble}>
              <div
                className={styles.sectionTitle}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <ArrowLeft
                  onClick={() => setActiveMenu("main")}
                  style={{ cursor: "pointer" }}
                />
                Card Properties
              </div>

              <div className={styles.toggleGroup}>
                {Object.entries(settings.show).map((v) => {
                  const s: ShowSetting = v[0] as unknown as ShowSetting;
                  const d = SETTING_KEY_TO_DETAILS[s];
                  return (
                    <div className={styles.toggleItem}>
                      <Flex align="center" gap="12px">
                        <Hashtag />
                        <Text className={styles.toggleItemText}>{d.label}</Text>
                      </Flex>
                      {v[1] ? (
                        <Tooltip content={"Hide Property"}>
                          <Eye
                            className={styles.eye}
                            onClick={() =>
                              onChangeSettings({
                                show: { ...settings.show, [s]: false },
                              })
                            }
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip content={"Show Property"}>
                          <EyeClosed
                            className={styles.eye}
                            onClick={() =>
                              onChangeSettings({
                                show: { ...settings.show, [s]: true },
                              })
                            }
                          />
                        </Tooltip>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
