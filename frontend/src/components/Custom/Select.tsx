import React from 'react';
import Select, { Props as SelectProps } from 'react-select';
import VirtualSelect from 'react-select-virtualized';

type Props = {
  isVirtual?: boolean;
};

const BTSelect = ({ isVirtual = false, ...props }: SelectProps & Props) => {
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
