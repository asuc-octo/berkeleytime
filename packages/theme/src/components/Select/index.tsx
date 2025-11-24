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

import { Badge } from "../Badge";
import { Color } from "../ThemeProvider";
import { SearchableSelect } from "./SearchableSelect";
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
export * from "./SearchableSelect";

export type OptionLabel = {
  type: "label";
  label: string;
};

export type OptionItem<T> = {
  value: T;
  label: string;
  meta?: string;
  color?: Color;
  disabled?: boolean;
  type?: "option";
};

export type Option<T> = OptionItem<T> | OptionLabel;

export interface SelectHandle {
  focus: () => void;
  openMenu: () => void;
}

export type SelectTab<T> = {
  value: string;
  label: string;
  options: Option<T>[];
};

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
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  customSearch?: (query: string, options: Option<T>[]) => Option<T>[];
  onSearchChange?: (query: string) => void;
  tabs?: SelectTab<T>[];
  defaultTab?: string;
  tabValue?: string;
  onTabChange?: (value: string) => void;
}

const isOptionItem = <T,>(option: Option<T>): option is OptionItem<T> => {
  return option.type !== "label";
};

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
  searchable = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  customSearch,
  onSearchChange,
  tabs,
  defaultTab,
  tabValue,
  onTabChange,
}: SelectProps<T>) {
  const [internalTab, setInternalTab] = useState<string | undefined>(() =>
    tabs?.length ? tabValue ?? defaultTab ?? tabs[0]?.value : undefined
  );

  useEffect(() => {
    if (!tabs?.length) {
      setInternalTab(undefined);
      return;
    }
    setInternalTab((prev) => {
      const tabValues = tabs.map((tab) => tab.value);
      if (tabValue) return tabValue;
      if (prev && tabValues.includes(prev)) return prev;
      const fallback = defaultTab ?? tabs[0]?.value;
      if (fallback && tabValues.includes(fallback)) return fallback;
      return prev ?? tabValues[0];
    });
  }, [tabValue, defaultTab, tabs]);

  const handleTabChange = (value: string) => {
    if (!tabValue) setInternalTab(value);
    onTabChange?.(value);
  };

  // If searchable is enabled OR tabs are provided, use SearchableSelect
  // Tabs only work with the searchable variant
  if (searchable || tabs?.length) {
    return (
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled}
        multi={multi}
        placeholder={placeholder}
        clearable={clearable}
        variant={variant}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        customSearch={customSearch}
        onSearchChange={onSearchChange}
        tabs={tabs}
        defaultTab={defaultTab}
        tabValue={tabValue ?? internalTab}
        onTabChange={handleTabChange}
      />
    );
  }

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

  const activeTabValue = useMemo(
    () =>
      tabs?.length
        ? tabValue ?? internalTab ?? defaultTab ?? tabs[0]?.value
        : undefined,
    [tabs, tabValue, internalTab, defaultTab]
  );

  const currentOptions = useMemo(
    () =>
      tabs?.length
        ? tabs.find((tab) => tab.value === activeTabValue)?.options ??
          tabs[0]?.options ??
          []
        : options,
    [options, tabs, activeTabValue]
  );

  const optionUniverse = useMemo(
    () => (tabs?.length ? tabs.flatMap((tab) => tab.options) : options),
    [tabs, options]
  );

  const allSelectableOptions = useMemo(
    () => optionUniverse.filter(isOptionItem),
    [optionUniverse]
  );

  // Auto-disable if no options available in any tab
  const hasAnyOptions = allSelectableOptions.length > 0;
  const hasNoOptions = !hasAnyOptions;
  const effectiveDisabled = disabled || hasNoOptions;
  const effectivePlaceholder = effectiveDisabled
    ? "No option available"
    : placeholder;

  const activeElem = useMemo(
    () =>
      Array.isArray(value)
        ? value.length === 0
          ? null
          : allSelectableOptions.filter((opt) =>
              value.some((v) => deepEqual(v, opt.value))
            )
        : allSelectableOptions.find((opt) => deepEqual(opt.value, value)),
    [value, allSelectableOptions]
  );

  const hasSelection = Array.isArray(activeElem)
    ? activeElem.length > 0
    : Boolean(activeElem);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild disabled={effectiveDisabled}>
        <Flex
          direction="row"
          ref={triggerRef}
          justify="between"
          align="center"
          className={classNames(styles.trigger, {
            [styles.selected]: hasSelection,
            [styles.disabled]: effectiveDisabled,
            [styles.foreground]: variant === "foreground",
          })}
          tabIndex={0}
          gap="12px"
        >
          {activeElem ? (
            Array.isArray(activeElem) ? (
              <Flex direction="row" gap="8px" wrap="wrap">
                {activeElem.map((el) => (
                  <Badge
                    key={el.label}
                    label={el.label}
                    color={el.color ? el.color : Color.Blue}
                    icon={
                      <Xmark
                        style={{ zIndex: 100 }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (!Array.isArray(value)) return;
                          const myV = allSelectableOptions.find(
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
            effectivePlaceholder
          )}
          <Flex direction="row" gap="8px" align="center">
            {clearable && hasSelection && (
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
      {!effectiveDisabled && (
        <DropdownMenu.Content
          className={styles.content}
          style={{ width: triggerWidth, zIndex: 999 }}
          sideOffset={5}
        >
          {currentOptions.length === 0 ? (
            <div className={styles.commandEmpty}>{emptyMessage}</div>
          ) : (
            currentOptions.map((opt, i) => {
              if (!isOptionItem(opt)) {
                return (
                  <div key={`label-${i}`} className={styles.sectionLabel}>
                    {opt.label}
                  </div>
                );
              }

              return (
                <DropdownMenu.Item
                  key={`${i}-${opt.label}`}
                  style={{ outline: "none" }}
                  disabled={opt.disabled}
                  onSelect={(e) => {
                    if (opt.disabled) {
                      e.preventDefault();
                      return;
                    }
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
                    disabled={opt.disabled}
                    selected={
                      Array.isArray(value)
                        ? value.some((v) => deepEqual(v, opt.value))
                        : deepEqual(value, opt.value)
                    }
                    color={opt.color}
                  />
                </DropdownMenu.Item>
              );
            })
          )}
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
