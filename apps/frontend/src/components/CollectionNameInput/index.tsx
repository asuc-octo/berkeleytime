import classNames from "classnames";
import { Circle } from "iconoir-react";

import { DropdownMenu } from "@repo/theme";

import styles from "./CollectionNameInput.module.scss";

export const COLLECTION_COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

interface CollectionNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  color: string | null;
  onColorChange: (color: string | null) => void;
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
        onChange={(e) => onChange(e.target.value)}
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
                  <span className={styles.colorDot} data-color={color} />
                  {color.charAt(0).toUpperCase() + color.slice(1)}
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
                  <span className={styles.colorDot} data-color={colorOption} />{" "}
                  {colorOption.charAt(0).toUpperCase() + colorOption.slice(1)}
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
