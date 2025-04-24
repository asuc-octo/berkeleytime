// components/Select.tsx
import ReactSelect, {
  GroupBase,
  Props as ReactSelectProps,
  StylesConfig,
} from "react-select";

export const createSelectStyles = <
  OptionType,
  IsMulti extends boolean = false,
>(): StylesConfig<OptionType, IsMulti> => ({
  control: (provided) => ({
    ...provided,
    height: "32px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--foreground-color)",
    color: "var(--paragraph-color)",
    borderRadius: "4px",
    "&:hover": {
      color: "var(--heading-color)",
    },
    "&:focus": {
      borderColor: "var(--blue-500)",
      outline: "4px solid var(--blue-200)",
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
    color: state.isFocused ? "var(--heading-color)" : "var(--paragraph-color)",
    cursor: "pointer",
  }),
  menu: (provided) => ({
    ...provided,
    background: "var(--foreground-color)",
    // zIndex: 9999, // optional
  }),
});

export interface SelectProps<OptionType, IsMulti extends boolean = false>
  extends ReactSelectProps<OptionType, IsMulti, GroupBase<OptionType>> {}

export function Select<OptionType, IsMulti extends boolean = false>(
  props: SelectProps<OptionType, IsMulti>
) {

  return (
    <ReactSelect<OptionType, IsMulti>
      {...props}
      styles={{ ...createSelectStyles(), ...props.styles }}
      components={{
        IndicatorSeparator: () => null,
        ...props.components,
      }}
    />
  );
}
