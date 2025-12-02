import classNames from "classnames";
import { Circle } from "iconoir-react";

import { Color, DropdownMenu } from "@repo/theme";

import {
  COLLECTION_COLORS,
  capitalizeColor,
  getColorStyle,
} from "@/lib/colors";

import styles from "./CollectionNameInput.module.scss";

interface CollectionNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  color: Color | null;
  onColorChange: (color: Color | null) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  showColorPicker?: boolean;
}

export function CollectionNameInput({
  value,
  onChange,
  onSubmit,
  color,
  onColorChange,
  placeholder = "New collection name",
  hasError = false,
  disabled = false,
  autoFocus = false,
  showColorPicker = true,
}: CollectionNameInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && !hasError && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className={styles.inputRow}>
      <input
        type="text"
        className={classNames(styles.input, { [styles.inputError]: hasError })}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val.charAt(0).toUpperCase() + val.slice(1));
        }}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      {showColorPicker && (
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button className={styles.colorSelectButton} type="button">
              {color ? (
                <>
                  <span
                    className={styles.colorDot}
                    style={getColorStyle(color)}
                  />
                  {capitalizeColor(color)}
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
            >
              <DropdownMenu.Item onSelect={() => onColorChange(null)}>
                <span className={styles.colorDotOutline} /> No color
              </DropdownMenu.Item>
              {COLLECTION_COLORS.map((colorOption) => (
                <DropdownMenu.Item
                  key={colorOption}
                  onSelect={() => onColorChange(colorOption)}
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
      )}
    </div>
  );
}

export default CollectionNameInput;
