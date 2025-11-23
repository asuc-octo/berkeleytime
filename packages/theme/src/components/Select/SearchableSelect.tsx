import { useEffect, useRef, useState } from "react";

import { Flex } from "@radix-ui/themes";
import classNames from "classnames";
import { Command } from "cmdk";
import { NavArrowDown, Search, Xmark } from "iconoir-react";
import { Popover } from "radix-ui";

import { Badge } from "../Badge";
import { PillSwitcher } from "../PillSwitcher";
import { Color } from "../ThemeProvider";
import styles from "./Select.module.scss";
import type { Option, OptionItem, SelectTab } from "./index";

// Helper function to compare values
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

const isOptionItem = <T,>(option: Option<T>): option is OptionItem<T> => {
  return option.type !== "label";
};

export interface SearchableSelectProps<T> {
  options?: Option<T>[];
  value: T | T[] | null;
  onChange: (newValue: T | T[] | null) => void;
  disabled?: boolean;
  multi?: boolean;
  placeholder?: string;
  clearable?: boolean;
  variant?: "default" | "foreground";
  searchPlaceholder?: string;
  emptyMessage?: string;
  customSearch?: (query: string, options: Option<T>[]) => Option<T>[];
  onSearchChange?: (query: string) => void;
  tabs?: SelectTab<T>[];
  defaultTab?: string;
  tabValue?: string;
  onTabChange?: (value: string) => void;
}

export function SearchableSelect<T>({
  options = [],
  value,
  onChange,
  disabled = false,
  multi = false,
  placeholder = "Select",
  clearable = false,
  variant = "default",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  customSearch,
  onSearchChange,
  tabs,
  defaultTab,
  tabValue,
  onTabChange,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const triggerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [internalTab, setInternalTab] = useState<string | undefined>(() =>
    tabs?.length ? tabValue ?? defaultTab ?? tabs[0]?.value : undefined
  );

  // Notify parent when search changes
  useEffect(() => {
    onSearchChange?.(searchValue);
  }, [searchValue, onSearchChange]);

  // Match trigger width using ResizeObserver
  useEffect(() => {
    if (!triggerRef.current) return;
    const updateWidth = () => {
      if (triggerRef.current) {
        setWidth(triggerRef.current.offsetWidth);
      }
    };
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(triggerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

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

  const activeTabValue = tabs?.length
    ? tabValue ?? internalTab ?? defaultTab ?? tabs[0]?.value
    : undefined;

  const currentOptions = tabs?.length
    ? tabs.find((tab) => tab.value === activeTabValue)?.options ??
      tabs[0]?.options ??
      []
    : options;

  const optionUniverse = tabs?.length
    ? tabs.flatMap((tab) => tab.options)
    : options;

  const allSelectableOptions = optionUniverse.filter(isOptionItem);

  // Auto-disable if no options available in any tab
  const hasAnyOptions = allSelectableOptions.length > 0;

  const hasNoOptions = !hasAnyOptions;
  const effectiveDisabled = disabled || hasNoOptions;
  const effectivePlaceholder = effectiveDisabled
    ? "No option available"
    : placeholder;

  // Find the active element(s) based on value
  const activeElem = multi
    ? Array.isArray(value)
      ? allSelectableOptions.filter((opt) =>
          value.some((v) => deepEqual(v, opt.value))
        )
      : []
    : allSelectableOptions.find((opt) => deepEqual(opt.value, value));

  const hasSelection = Array.isArray(activeElem)
    ? activeElem.length > 0
    : Boolean(activeElem);

  // Clear search when opening/closing
  useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  const handleSelect = (optValue: T) => {
    if (multi) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.some((v) => deepEqual(v, optValue));

      if (isSelected) {
        onChange(currentValues.filter((v) => !deepEqual(v, optValue)));
      } else {
        onChange([...currentValues, optValue]);
      }
    } else {
      onChange(optValue);
      setOpen(false);
    }
  };

  const handleRemoveBadge = (optValue: T) => {
    if (!Array.isArray(value)) return;
    onChange(value.filter((v) => !deepEqual(v, optValue)));
  };

  // Organize options into groups and filter based on search
  const renderGroupedOptions = () => {
    const searchLower = searchValue.toLowerCase();
    let hasVisibleItems = false;

    // If parent controls search via onSearchChange, use options as-is
    // Otherwise, apply custom search or default filtering
    const filteredOptions = onSearchChange
      ? currentOptions
      : customSearch && searchValue
        ? customSearch(searchValue, currentOptions)
        : currentOptions;

    // Group structure: { groupLabel: string | null, items: OptionItem[] }[]
    const groups: Array<{ label: string | null; items: OptionItem<T>[] }> = [];
    let currentGroup: { label: string | null; items: OptionItem<T>[] } = {
      label: null,
      items: [],
    };

    filteredOptions.forEach((opt) => {
      if (!isOptionItem(opt)) {
        // Start a new group
        if (currentGroup.items.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = { label: opt.label, items: [] };
      } else {
        // If parent controls search or custom search is used, include all items (already filtered)
        // Otherwise, apply default substring filtering
        const shouldInclude =
          onSearchChange || customSearch
            ? true
            : !searchValue ||
              opt.label.toLowerCase().includes(searchLower) ||
              opt.meta?.toLowerCase().includes(searchLower);

        if (shouldInclude) {
          currentGroup.items.push(opt);
          hasVisibleItems = true;
        }
      }
    });

    // Add the last group
    if (currentGroup.items.length > 0) {
      groups.push(currentGroup);
    }

    // If no visible items, show empty state
    if (!hasVisibleItems) {
      return (
        <Command.Empty className={styles.commandEmpty}>
          {emptyMessage}
        </Command.Empty>
      );
    }

    // Render groups
    return groups.map((group, groupIndex) => {
      const groupKey = group.label || `no-label-${groupIndex}`;

      const items = group.items.map((opt, itemIndex) => {
        const selected = Array.isArray(value)
          ? value.some((v) => deepEqual(v, opt.value))
          : deepEqual(value, opt.value);

        return (
          <Command.Item
            key={`${groupIndex}-${itemIndex}-${opt.label}`}
            value={opt.label}
            disabled={opt.disabled}
            onSelect={() => {
              if (opt.disabled) return;
              handleSelect(opt.value);
            }}
            className={classNames(styles.commandItem, {
              [styles.selected]: selected,
              [styles.disabled]: opt.disabled,
            })}
          >
            <Flex direction="row" justify="between" align="center" width="100%">
              <span>{opt.label}</span>
              {opt.meta && <span className={styles.meta}>{opt.meta}</span>}
            </Flex>
          </Command.Item>
        );
      });

      // If group has a label, wrap in Command.Group
      if (group.label) {
        return (
          <Command.Group
            key={groupKey}
            heading={group.label}
            className={styles.commandGroup}
          >
            {items}
          </Command.Group>
        );
      }

      // Otherwise, render items directly
      return items;
    });
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={effectiveDisabled}>
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
          {hasSelection ? (
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
                          handleRemoveBadge(el.value);
                          e.preventDefault();
                        }}
                      />
                    }
                  />
                ))}
              </Flex>
            ) : (
              (activeElem as OptionItem<T>).label
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
      </Popover.Trigger>
      {!effectiveDisabled && (
        <Popover.Content
          className={styles.searchableContent}
          style={{ width, zIndex: 999 }}
          sideOffset={5}
          align="start"
        >
          <Command shouldFilter={false}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} width={16} height={16} />
              <Command.Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onValueChange={setSearchValue}
                className={styles.searchInput}
              />
            </div>
            {tabs?.length ? (
              <div className={styles.tabsWrapperSearchable}>
                <PillSwitcher
                  value={activeTabValue}
                  defaultValue={defaultTab || tabs[0]?.value}
                  items={tabs.map((tab) => ({
                    value: tab.value,
                    label: tab.label,
                  }))}
                  fullWidth
                  onValueChange={(value) => {
                    if (!tabValue) setInternalTab(value);
                    setSearchValue("");
                    onTabChange?.(value);
                  }}
                />
              </div>
            ) : null}
            <Command.List className={styles.commandList}>
              {renderGroupedOptions()}
            </Command.List>
          </Command>
        </Popover.Content>
      )}
    </Popover.Root>
  );
}
