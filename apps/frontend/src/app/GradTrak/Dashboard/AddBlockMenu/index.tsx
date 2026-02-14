import { useEffect, useRef, useState } from "react";

import { ArrowLeft, LongArrowDownLeft, NavArrowRight } from "iconoir-react";

import { Button, Input, Select } from "@repo/theme";

import { PlanTermInput, Status, Terms } from "@/lib/generated/graphql";

import styles from "./AddBlockMenu.module.scss";

type AddBlockMenuProps = {
  onClose: () => void;
  createNewPlanTerm: (planTerm: PlanTermInput) => void;
};

export default function AddBlockMenu({
  onClose,
  createNewPlanTerm,
}: AddBlockMenuProps) {
  const [activeMenu, setActiveMenu] = useState<"main" | "semester" | "custom">(
    "main"
  );
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [customName, setCustomName] = useState("");

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear + 5 - 2020 + 1 },
    (_, i) => ({
      label: (2020 + i).toString(),
      value: 2020 + i,
    })
  );

  const semesterOptions = [
    { label: "Fall", value: "Fall" },
    { label: "Spring", value: "Spring" },
    { label: "Summer", value: "Summer" },
  ];

  const handleSemesterSelect = (value: string | string[] | null) => {
    if (value === null || Array.isArray(value)) {
      return;
    } else {
      setSelectedTerm(value);
    }
  };

  const handleYearSelect = (value: number | number[] | null) => {
    if (value === null || Array.isArray(value)) {
      return;
    } else {
      setSelectedYear(value);
    }
  };

  const handleSubmitSemester = () => {
    createNewPlanTerm({
      name: `${selectedTerm} ${selectedYear}`,
      year: selectedYear ? selectedYear : currentYear,
      term: selectedTerm ? (selectedTerm as Terms) : Terms.Fall,
      hidden: false,
      status: Status.Incomplete,
      pinned: false,
      courses: [],
    });
    setSelectedTerm(null);
    setSelectedYear(null);
    setActiveMenu("main");
    onClose?.();
  };

  const handleSubmitCustom = () => {
    createNewPlanTerm({
      name: customName,
      year: -1,
      term: Terms.Misc,
      hidden: false,
      status: Status.Incomplete,
      pinned: false,
      courses: [],
    });
    setCustomName("");
    setActiveMenu("main");
    onClose?.();
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (
        e.target instanceof Node &&
        !el.contains(e.target) &&
        !(e.target instanceof Element && e.target.closest("[data-radix-popper-content-wrapper]"))
      ) {
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

  return (
    <div ref={containerRef} className={styles.addBlockMenu}>
      {activeMenu == "main" ? (
        <div>
          <div className={styles.section}>
            <div
              className={styles.sectionBubbleButton}
              onClick={() => {
                setActiveMenu("semester");
              }}
            >
              New Semester Block
              <NavArrowRight className={styles.arrow} />
            </div>
          </div>
          <div className={styles.section}>
            <div
              className={styles.sectionBubbleButton}
              onClick={() => {
                setActiveMenu("custom");
              }}
            >
              Create Custom Block
              <NavArrowRight className={styles.arrow} />
            </div>
          </div>
        </div>
      ) : activeMenu == "semester" ? (
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
              New Semester Block
            </div>
            <div className={styles.inputGroup}>
              <Select
                options={semesterOptions}
                value={selectedTerm}
                onChange={handleSemesterSelect}
                placeholder="Select a semester..."
                multi={false}
              />
              <Select
                options={yearOptions}
                value={selectedYear}
                onChange={handleYearSelect}
                placeholder="Select a year..."
                multi={false}
              />
              <Button
                variant="primary"
                className={styles.confirmButton}
                onClick={handleSubmitSemester}
                disabled={!selectedTerm || !selectedYear}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : (
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
              New custom block
            </div>
            <div className={styles.inputContainer}>
              <div>
                <Input
                  type="text"
                  value={customName}
                  placeholder="New block..."
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                className={styles.confirmButton}
                onClick={handleSubmitCustom}
                disabled={!customName}
              >
                Done
                <LongArrowDownLeft />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
