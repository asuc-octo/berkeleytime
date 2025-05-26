import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { Flex } from "@radix-ui/themes";
import classNames from "classnames";
import { NavArrowDown, Xmark } from "iconoir-react";
import { DropdownMenu } from "radix-ui";

import { Badge } from "../Badge";
import styles from "./Select.module.scss";
import SelectItem from "./SelectItem";

export type Option<T> = { value: T; label: string };

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
  placeholder?: string;
  clearable?: boolean;
  ref?: React.Ref<SelectHandle>;
  variant?: "default" | "foreground";
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
  placeholder = "Select",
  clearable = false,
  ref,
  variant = "default",
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

  const activeLabel = useMemo(
    () =>
      Array.isArray(value)
        ? value.length === 0
          ? null
          : options
              .filter((opt) => value.includes(opt.value))
              .map((opt) => opt.label)
        : options.find((opt) => opt.value === value)?.label,
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
            [styles.selected]: activeLabel,
            [styles.disabled]: disabled,
            [styles.foreground]: variant === "foreground",
          })}
          tabIndex={0}
          gap="12px"
        >
          {activeLabel ? (
            Array.isArray(activeLabel) ? (
              <Flex direction="row" gap="8px" wrap="wrap">
                {activeLabel.map((l) => (
                  <Badge
                    label={l}
                    color="blue"
                    icon={
                      <Xmark
                        style={{ zIndex: 100 }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (!Array.isArray(value)) return;
                          const myV = options.find(
                            (opt) => opt.label === l
                          )?.value;
                          onChange(value.filter((v) => v !== myV));
                          e.preventDefault();
                        }}
                      />
                    }
                  />
                ))}
              </Flex>
            ) : (
              activeLabel
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
                onSelect={(e) => {
                  if (multi) {
                    e.preventDefault();
                    let newValues: T[];
                    if (Array.isArray(value))
                      newValues = structuredClone(value);
                    else newValues = [];
                    if (!newValues.includes(opt.value)) {
                      newValues.push(opt.value);
                      onChange(newValues);
                    } else onChange(newValues.filter((v) => v !== opt.value));
                  } else onChange(opt.value);
                }}
              >
                <SelectItem
                  label={opt.label}
                  multi={multi}
                  selected={
                    Array.isArray(value)
                      ? value.includes(opt.value)
                      : value === opt.value
                  }
                />
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      )}
    </DropdownMenu.Root>
  );
}
