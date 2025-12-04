import { useEffect, useRef, useState } from "react";

import { NavArrowDown } from "iconoir-react";
import { createPortal } from "react-dom";

import { Color } from "@/lib/generated/graphql";
import { Color as ThemeColor } from "@repo/theme";

import styles from "./ColorSelector.module.scss";

interface ColorSelectorProps {
  selectedColor: Color;
  onColorSelect: (color: Color) => void;
  allowedColors?: Color[];
  usePortal?: boolean;
}

export const LabelColor = (props: { color: Color }) => {
  return (
    <div
      className={styles.colorLabel}
      style={{
        backgroundColor: `var(--${props.color}-500-20)`,
        borderColor: `var(--${props.color}-500)`,
      }}
    ></div>
  );
};

export default function ColorSelector({
  selectedColor,
  onColorSelect,
  allowedColors = Object.values(ThemeColor),
  usePortal = true,
}: ColorSelectorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePopupPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.top + 20, // Position it just below the color selector button
        left: rect.left - 60,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(`.${styles.colorSelect}`) &&
        !target.closest(`.${styles.colorPicker}`)
      ) {
        if (showColorPicker) {
          setShowColorPicker(false);
        }
      }
    };

    if (showColorPicker) {
      updatePopupPosition();
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showColorPicker]);

  const colorPickerJSX = (
    <div
      className={styles.colorPicker}
      style={{
        position: usePortal ? "fixed" : "absolute",
        top: usePortal ? popupPosition.top : "20px",
        left: usePortal ? popupPosition.left : "10px",
        zIndex: 9999,
      }}
    >
      {allowedColors.map((color) => (
        <div
          key={color}
          className={styles.colorOption}
          style={{
            backgroundColor: `var(--${color}-500-20)`,
            border:
              selectedColor === color
                ? "2px solid var(--blue-500)"
                : `1px solid var(--${color}-500)`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowColorPicker(false);
            onColorSelect(color);
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className={styles.colorSelectorContainer}
      ref={containerRef}
      data-color-selector
    >
      <div
        className={styles.colorSelect}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowColorPicker(true);
        }}
      >
        <LabelColor color={selectedColor} />
        <NavArrowDown />
      </div>
      {showColorPicker &&
        (usePortal
          ? createPortal(colorPickerJSX, document.body)
          : colorPickerJSX)}
    </div>
  );
}
