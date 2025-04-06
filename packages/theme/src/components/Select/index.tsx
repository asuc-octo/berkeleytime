// components/Select.tsx
import ReactSelect, {
  GroupBase,
  Props as ReactSelectProps,
  StylesConfig,
} from "react-select";

export interface SelectProps<OptionType, IsMulti extends boolean = false>
  extends ReactSelectProps<OptionType, IsMulti, GroupBase<OptionType>> {}

export function Select<OptionType, IsMulti extends boolean = false>(
  props: SelectProps<OptionType, IsMulti>
) {
  // Default styles (can override with `styles` prop)
  const style: StylesConfig<OptionType, IsMulti> = {
    control: (provided) => ({
      ...provided,
      border: "1px solid var(--border-color)",
      backgroundColor: "var(--foreground-color)",
      color: "var(--paragraph-color)",
      borderRadius: "4px",
      "&:hover": {
        borderColor: "var(--heading-color)",
      },
      "&:focus": {
        borderColor: "var(--heading-color)",
      },
      fontSize: "14px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--paragraph-color)",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? "var(--border-color)"
        : "var(--foreground-color)",
      color: state.isFocused
        ? "var(--heading-color)"
        : "var(--paragraph-color)",
      cursor: "pointer",
    }),
    menu: (provided) => ({
      ...provided,
      background: "var(--foreground-color)",
      // zIndex: 9999, // optional, useful if dropdown gets hidden
    }),
  };

  return (
    <ReactSelect<OptionType, IsMulti>
      {...props}
      styles={{ ...style, ...props.styles }}
      components={{
        IndicatorSeparator: () => null,
        ...props.components,
      }}
    />
  );
}
