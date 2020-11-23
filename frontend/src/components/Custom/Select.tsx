import React from 'react';
import Select, { Props as SelectProps } from 'react-select';
import VirtualSelect from 'react-select-virtualized';

const BTSelect = (props: SelectProps, isVirtual: boolean = false) => {
  const Component = isVirtual ? VirtualSelect : Select;
  return (
    <Component
      {...props}
      components={{
        IndicatorSeparator: () => null,
      }}
    />
  );
};

export default BTSelect;