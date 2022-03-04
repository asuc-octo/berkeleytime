import React from "react";
import Select, { Props as SelectProps } from "react-select";
import VirtualSelect from "react-select-virtualized";

type Props = {
  isVirtual?: boolean;
  isMulti?: boolean;
  value?:
    | { label: string; value: string }
    | { label: string; value: string }[]
    | null;
};

const BTSelect = ({
  isVirtual = false,
  isMulti,
  value,
  ...props
}: Omit<SelectProps, "value"> & Props) => {
  const Component = isVirtual ? VirtualSelect : Select;
  return (
    <Component
      isMulti={isMulti}
      value={value}
      {...props}
      components={{
        IndicatorSeparator: () => null,
      }}
    />
  );
};

export default BTSelect;
