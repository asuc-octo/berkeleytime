import { Circle } from "iconoir-react";

import { DropdownMenu, Color as ThemeColor } from "@repo/theme";

import { capitalizeColor, getColorStyle } from "@/lib/colors";
import { Color } from "@/lib/generated/graphql";

// eslint-disable-next-line css-modules/no-unused-class
import styles from "./ColorSelector.module.scss";

interface ColorSelectorProps {
  selectedColor: Color;
  onColorSelect: (color: Color) => void;
  allowedColors?: Color[];
  usePortal?: boolean; // Deprecated: kept for backward compatibility, no longer used
}

export default function ColorSelector({
  selectedColor,
  onColorSelect,
  allowedColors = Object.values(ThemeColor),
}: ColorSelectorProps) {
  return (
    <div className={styles.colorSelectorContainer} data-color-selector>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <button className={styles.colorSelectButton} type="button">
            {selectedColor ? (
              <>
                <span
                  className={styles.colorDot}
                  style={getColorStyle(selectedColor)}
                />
                {capitalizeColor(selectedColor)}
              </>
            ) : (
              <>
                <Circle width={14} height={14} />
                No color
              </>
            )}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={5}
            align="start"
            className={styles.colorDropdown}
            onWheel={(e) => {
              // Allow wheel events to scroll the dropdown content
              e.stopPropagation();
            }}
          >
            {allowedColors.map((colorOption) => (
              <DropdownMenu.Item
                key={colorOption}
                onSelect={() => onColorSelect(colorOption)}
              >
                <span
                  className={styles.colorDot}
                  style={getColorStyle(colorOption)}
                />{" "}
                {capitalizeColor(colorOption)}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
