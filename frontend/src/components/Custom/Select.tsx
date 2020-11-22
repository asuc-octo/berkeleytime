import React from 'react';
import Select, { Props as SelectProps } from 'react-select';

const BTSelect = (props: SelectProps) => {
  return (
    <Select
      {...props}
      components={{
        IndicatorSeparator: () => null,
      }}
    />
  );
};

export default BTSelect;