import { StylesConfig } from 'react-select';

interface OptionType {
  value: string;
  label: string;
}

export const termSelectStyle: StylesConfig<OptionType> = {
  control: (base) => ({
    ...base,
    borderColor: "var(--border-color)",
    height: "38px",
    width: "100%",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "4px",
    border: "1px solid var(--border-color)",
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  option: (base) => ({
    ...base,
    cursor: "pointer",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "var(--blue-500)",
      color: "white",
    },
  }),
  input: (base) => ({
    ...base,
    color: "var(--paragraph-color)",
    overflow: "hidden",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--paragraph-color)",
    userSelect: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--paragraph-color)",
    cursor: "pointer",
  }),
  clearIndicator: (base, { getValue, selectProps: { inputValue } }) => ({
    ...base,
    display: getValue()[0]?.value === "all" || inputValue ? "none" : "flex",
    cursor: "pointer",
  }),
};