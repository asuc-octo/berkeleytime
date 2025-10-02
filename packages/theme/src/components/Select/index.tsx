import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { Flex } from "@radix-ui/themes";
import classNames from "classnames";
import { NavArrowDown, Plus, Xmark } from "iconoir-react";
import { DropdownMenu } from "radix-ui";

import { BadgeLabel } from "../Badge";
import { Color } from "../ThemeProvider";
import styles from "./Select.module.scss";
import SelectItem from "./SelectItem";

// Helper function to compare objects by their key-value pairs
const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return false;

  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

export * from "./SelectItem";

export type Option<T> = {
  value: T;
  label: string;
  meta?: string;
  color?: Color;
};

export interface SelectHandle {
  focus: () => void;
  openMenu: () => void;
}

// TODO: any way to constrain types? Using/not using a list for value
// when not multi is undefined and causes strange behavior
export interface SelectProps<T> {
  options?: Option<T>[];
  value: T | T[] | null;
  onChange: (newValue: T | T[] | null) => void;
  disabled?: boolean;
  multi?: boolean;
  checkboxMulti?: boolean;
  placeholder?: string;
  clearable?: boolean;
  ref?: React.Ref<SelectHandle>;
  variant?: "default" | "foreground";
  addOption?: {
    text: string;
    onClick: () => void;
  };
}

export function useMatchTriggerWidth<T extends HTMLElement>() {
  const triggerRef = useRef<T | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!triggerRef.current) return;
    const updateWidth = () => {
      if (triggerRef.current) {
        setWidth(triggerRef.current.offsetWidth);
      }
    };
    updateWidth(); // initial call
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(triggerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  return { triggerRef, triggerWidth: width };
}

export function Select<T>({
  options = [],
  value,
  onChange,
  disabled = false,
  multi = false,
  checkboxMulti = false,
  placeholder = "Select",
  clearable = false,
  ref,
  variant = "default",
  addOption,
}: SelectProps<T>) {
  const { triggerRef, triggerWidth } = useMatchTriggerWidth<HTMLDivElement>();

  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      triggerRef.current?.focus();
    },
    openMenu: () => {
      setOpen(true);
    },
  }));

  const activeElem = useMemo(
    () =>
      Array.isArray(value)
        ? value.length === 0
          ? null
          : options.filter((opt) => value.some((v) => deepEqual(v, opt.value)))
        : options.find((opt) => opt.value === value),
    [value]
  );

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <Flex
          direction="row"
          ref={triggerRef}
          justify="between"
          className={classNames(styles.trigger, {
            [styles.selected]: activeElem,
            [styles.disabled]: disabled,
            [styles.foreground]: variant === "foreground",
          })}
          tabIndex={0}
          gap="12px"
        >
          {activeElem ? (
            Array.isArray(activeElem) ? (
              <Flex direction="row" gap="8px" wrap="wrap">
                {activeElem.map((el) => (
                  <BadgeLabel
                    label={el.label}
                    color={el.color ? el.color : Color.blue}
                    icon={
                      <Xmark
                        style={{ zIndex: 100 }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (!Array.isArray(value)) return;
                          const myV = options.find(
                            (opt) => opt.label === el.label
                          )?.value;
                          onChange(value.filter((v) => !deepEqual(v, myV)));
                          e.preventDefault();
                        }}
                      />
                    }
                  />
                ))}
              </Flex>
            ) : (
              activeElem.label
            )
          ) : (
            placeholder
          )}
          <Flex direction="row" gap="8px">
            {clearable && (
              <Xmark
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onChange(null);
                  e.preventDefault();
                }}
              />
            )}
            <NavArrowDown />
          </Flex>
        </Flex>
      </DropdownMenu.Trigger>
      {!disabled && (
        <DropdownMenu.Content
          className={styles.content}
          style={{ width: triggerWidth, zIndex: 999 }}
          sideOffset={5}
        >
          {options.map((opt, i) => {
            return (
              <DropdownMenu.Item
                key={i}
                style={{ outline: "none" }}
                onSelect={(e) => {
                  if (multi) {
                    e.preventDefault();
                    let newValues: T[];
                    if (Array.isArray(value))
                      newValues = structuredClone(value);
                    else newValues = [];
                    if (!newValues.some((v) => deepEqual(v, opt.value))) {
                      newValues.push(opt.value);
                      onChange(newValues);
                    } else
                      onChange(
                        newValues.filter((v) => !deepEqual(v, opt.value))
                      );
                  } else onChange(opt.value);
                }}
              >
                <SelectItem
                  label={opt.label}
                  meta={opt.meta}
                  checkboxMulti={checkboxMulti}
                  selected={
                    Array.isArray(value)
                      ? value.some((v) => deepEqual(v, opt.value))
                      : deepEqual(value, opt.value)
                  }
                  color={opt.color}
                />
              </DropdownMenu.Item>
            );
          })}
          {addOption && (
            <DropdownMenu.Item
              key="add"
              onSelect={addOption.onClick}
              className={styles.addOption}
            >
              <Plus
                style={{
                  position: "relative",
                  top: "2px",
                }}
              />{" "}
              {addOption.text}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      )}
    </DropdownMenu.Root>
  );
}
