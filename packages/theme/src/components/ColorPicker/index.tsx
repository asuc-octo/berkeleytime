import classNames from "classnames";
import { Circle } from "iconoir-react";

import { DropdownMenu } from "../DropdownMenu";
import { Color } from "../ThemeProvider";
import styles from "./ColorPicker.module.scss";

interface ColorPickerProps {
  value: Color | null;
  onChange: (color: Color | null) => void;
  colors: readonly Color[];
  allowNull?: boolean;
  className?: string;
  disabled?: boolean;
}

function capitalize(color: Color): string {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

function getColorStyle(color: Color | null): React.CSSProperties | undefined {
  return color ? { backgroundColor: `var(--${color}-300)` } : undefined;
}

export function ColorPicker({
  value,
  onChange,
  colors,
  allowNull = true,
  className,
  disabled = false,
}: ColorPickerProps) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          className={classNames(styles.trigger, className)}
          type="button"
          disabled={disabled}
        >
          {value ? (
            <>
              <span className={styles.colorDot} style={getColorStyle(value)} />
              {capitalize(value)}
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
          className={styles.dropdown}
        >
          {allowNull && (
            <DropdownMenu.Item onSelect={() => onChange(null)}>
              <span className={styles.colorDotOutline} /> No color
            </DropdownMenu.Item>
          )}
          {colors.map((color) => (
            <DropdownMenu.Item key={color} onSelect={() => onChange(color)}>
              <span className={styles.colorDot} style={getColorStyle(color)} />{" "}
              {capitalize(color)}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default ColorPicker;
