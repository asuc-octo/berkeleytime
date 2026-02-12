/**
 * Select Component
 *
 * A unified, flexible select component supporting single-select, multi-select,
 * searchable dropdowns, and tabs.
 *
 * @features
 * - Single and multi-select modes
 * - Searchable with custom search functions
 * - Tab support for organizing options into groups
 * - Checkbox multi-select variant
 * - Colored options with badges
 * - Clearable selections
 * - Auto-disable when no options available
 * - Custom add option button
 *
 * @example Basic Single Select
 * ```tsx
 * <Select
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}
 *   placeholder="Select an option"
 * />
 * ```
 *
 * @example Multi-Select
 * ```tsx
 * <Select
 *   multi
 *   value={selectedValues}
 *   onChange={setSelectedValues}
 *   options={options}
 *   placeholder="Select multiple"
 * />
 * ```
 *
 * @example Searchable Select
 * ```tsx
 * <Select
 *   searchable
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 *   options={options}
 *   searchPlaceholder="Search options..."
 *   placeholder="Select with search"
 * />
 * ```
 *
 * @example Multi-Select with Checkboxes
 * ```tsx
 * <Select
 *   multi
 *   checkboxMulti
 *   value={selectedValues}
 *   onChange={setSelectedValues}
 *   options={options}
 * />
 * ```
 *
 * @example Select with Tabs
 * ```tsx
 * <Select
 *   searchable
 *   tabs={[
 *     { value: 'tab1', label: 'Category 1', options: options1 },
 *     { value: 'tab2', label: 'Category 2', options: options2 }
 *   ]}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 * />
 * ```
 *
 * @example Colored Options
 * ```tsx
 * <Select
 *   options={[
 *     { value: 'red', label: 'Red Item', color: Color.Red },
 *     { value: 'blue', label: 'Blue Item', color: Color.Blue }
 *   ]}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 * />
 * ```
 *
 * @example Custom Search Function
 * ```tsx
 * <Select
 *   searchable
 *   customSearch={(query, options) => {
 *     // Custom fuzzy search logic
 *     return options.filter(opt =>
 *       isOptionItem(opt) && fuzzyMatch(opt.label, query)
 *     )
 *   }}
 *   options={options}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 * />
 * ```
 *
 * @example Grouped Options with Labels
 * ```tsx
 * <Select
 *   options={[
 *     { type: 'label', label: 'Group 1' },
 *     { value: 'a', label: 'Option A' },
 *     { value: 'b', label: 'Option B' },
 *     { type: 'label', label: 'Group 2' },
 *     { value: 'c', label: 'Option C' }
 *   ]}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 * />
 * ```
 *
 * @props
 * - `options`: Array of options (can include labels for grouping)
 * - `value`: Selected value(s) - single value for single-select, array for multi-select
 * - `onChange`: Callback when selection changes
 * - `multi`: Enable multi-select mode (default: false)
 * - `checkboxMulti`: Show checkboxes in multi-select mode (default: false, only works in non-searchable mode)
 * - `searchable`: Enable search functionality (default: false)
 * - `tabs`: Tab configuration for organizing options (forces searchable mode)
 * - `clearable`: Show clear button to reset selection (default: false)
 * - `disabled`: Disable the select (default: false)
 * - `loading`: Show loading state with "Loading content" text and disable interaction (default: false)
 * - `variant`: Visual variant - 'default' or 'foreground' (default: 'default')
 * - `placeholder`: Placeholder text when nothing selected
 * - `searchPlaceholder`: Placeholder for search input (searchable mode only)
 * - `emptyMessage`: Message shown when no options match
 * - `customSearch`: Custom search filter function
 * - `onSearchChange`: Callback when search value changes (for external control)
 * - `addOption`: Custom add option button config
 * - `defaultTab`: Initial tab value (uncontrolled)
 * - `tabValue`: Current tab value (controlled)
 * - `onTabChange`: Callback when tab changes
 *
 * @notes
 * - Tabs automatically enable searchable mode
 * - checkboxMulti only works in non-searchable mode (DropdownMenu variant)
 * - Colors are applied to both badges and dropdown items
 * - Options can include meta text for additional information (e.g., counts)
 */
import { useEffect, useImperativeHandle, useMemo, useState } from "react";

import { Flex } from "@radix-ui/themes";
import classNames from "classnames";
import { Command } from "cmdk";
import { NavArrowDown, Plus, Search, Xmark } from "iconoir-react";
import { DropdownMenu, Popover } from "radix-ui";

import { useStack } from "../../hooks/useStack";
import { getSelectContentZIndex } from "../../layers";
import { Badge } from "../Badge";
import { PillSwitcher } from "../PillSwitcher";
import { Color } from "../ThemeProvider";
import styles from "./Select.module.scss";
import SelectItem from "./SelectItem";
import { deepEqual, isOptionItem, useMatchTriggerWidth } from "./utils";

export { SelectItem };

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

export interface SelectProps<T> {
  options?: Option<T>[];
  value: T | T[] | null;
  onChange: (newValue: T | T[] | null) => void;
  disabled?: boolean;
  loading?: boolean;
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
  selectedLabel?: string;
  style?: React.CSSProperties;
  maxListHeight?: number;
}

export function Select<T>({
  options = [],
  value,
  onChange,
  disabled = false,
  loading = false,
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
  selectedLabel,
  style,
  maxListHeight,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [internalTab, setInternalTab] = useState<string | undefined>(() =>
    tabs?.length ? (tabValue ?? defaultTab ?? tabs[0]?.value) : undefined
  );

  const stack = useStack();
  const contentZIndex = getSelectContentZIndex(stack);
  const { triggerRef, triggerWidth } = useMatchTriggerWidth<HTMLDivElement>();

  // Tabs force searchable mode
  const isSearchable = searchable || Boolean(tabs?.length);

  useImperativeHandle(ref, () => ({
    focus: () => {
      triggerRef.current?.focus();
    },
    openMenu: () => {
      setOpen(true);
    },
  }));

  // Notify parent when search changes
  useEffect(() => {
    if (isSearchable) {
      onSearchChange?.(searchValue);
    }
  }, [searchValue, onSearchChange, isSearchable]);

  // Clear search when opening/closing
  useEffect(() => {
    if (!open && isSearchable) {
      setSearchValue("");
    }
  }, [open, isSearchable]);

  // Manage tab state
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
    setSearchValue("");
    onTabChange?.(value);
  };

  const activeTabValue = useMemo(
    () =>
      tabs?.length
        ? (tabValue ?? internalTab ?? defaultTab ?? tabs[0]?.value)
        : undefined,
    [tabs, tabValue, internalTab, defaultTab]
  );

  const currentOptions = useMemo(
    () =>
      tabs?.length
        ? (tabs.find((tab) => tab.value === activeTabValue)?.options ??
          tabs[0]?.options ??
          [])
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

  // Keep select usable even when no options match; only disable when explicitly disabled or loading
  const effectiveDisabled = disabled || loading;
  const effectivePlaceholder = loading ? "Loading content" : placeholder;

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
    : Boolean(activeElem) || (value !== null && Boolean(selectedLabel));

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

  // Trigger content (shared between searchable and non-searchable)
  const triggerContent = (
    <>
      <div className={styles.triggerLabel}>
        {hasSelection ? (
          Array.isArray(activeElem) ? (
            <Flex className={styles.badgeContainer}>
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
          ) : activeElem ? (
            (activeElem as OptionItem<T>).label
          ) : (
            selectedLabel
          )
        ) : (
          effectivePlaceholder
        )}
      </div>
      <Flex
        direction="row"
        gap="8px"
        align="center"
        className={styles.triggerActions}
      >
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
    </>
  );

  // Organize options into groups and filter based on search (for searchable mode)
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
            style={{ outline: "none" }}
          >
            <SelectItem
              label={opt.label}
              meta={opt.meta}
              selected={selected}
              disabled={opt.disabled}
              color={opt.color}
              checkboxMulti={multi}
            />
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

  // SEARCHABLE MODE: Use Popover + Command (cmdk)
  if (isSearchable) {
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
            style={style}
          >
            {triggerContent}
          </Flex>
        </Popover.Trigger>
        {!effectiveDisabled && (
          <Popover.Portal>
            <Popover.Content
              className={styles.searchableContent}
              style={{ width: triggerWidth, zIndex: contentZIndex }}
              sideOffset={5}
              align="start"
              collisionPadding={8}
            >
              <Command shouldFilter={false}>
                <div className={styles.searchInputWrapper}>
                  <Search
                    className={styles.searchIcon}
                    width={16}
                    height={16}
                  />
                  <Command.Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onValueChange={setSearchValue}
                    className={styles.searchInput}
                  />
                </div>
                {tabs?.length ? (
                  <div className={styles.tabsWrapper}>
                    <PillSwitcher
                      value={activeTabValue}
                      defaultValue={defaultTab || tabs[0]?.value}
                      items={tabs.map((tab) => ({
                        value: tab.value,
                        label: tab.label,
                      }))}
                      fullWidth
                      onValueChange={handleTabChange}
                    />
                  </div>
                ) : null}
                <Command.List
                  className={styles.commandList}
                  style={
                    maxListHeight ? { maxHeight: maxListHeight } : undefined
                  }
                >
                  {renderGroupedOptions()}
                </Command.List>
              </Command>
            </Popover.Content>
          </Popover.Portal>
        )}
      </Popover.Root>
    );
  }

  // NON-SEARCHABLE MODE: Use DropdownMenu
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
          style={style}
        >
          {triggerContent}
        </Flex>
      </DropdownMenu.Trigger>
      {!effectiveDisabled && (
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={styles.content}
            style={{
              width: triggerWidth,
              zIndex: contentZIndex,
              ...(maxListHeight ? { maxHeight: maxListHeight } : {}),
            }}
            sideOffset={5}
            collisionPadding={8}
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
                      checkboxMulti={multi || checkboxMulti}
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
        </DropdownMenu.Portal>
      )}
    </DropdownMenu.Root>
  );
}
