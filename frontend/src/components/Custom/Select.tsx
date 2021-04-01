import { Theme } from 'bt/types';
import React from 'react';
import { useSelector } from 'react-redux';
import Select, { Theme as SelectTheme, Props as SelectProps } from 'react-select';
import VirtualSelect from 'react-select-virtualized';
import { ReduxState } from 'redux/store';
import themed from 'bt/themed_colors';
import { basename } from 'node:path';

type Props = {
  isVirtual?: boolean;
  isMulti?: boolean;
  value?: { label: string; value: string } | { label: string; value: string }[] | null;
};

const BTSelect = ({
  isVirtual = false,
  isMulti,
  value,
  ...props
}: Omit<SelectProps, 'value'> & Props) => {
  const theme = useSelector<ReduxState, Theme>(state => state.common.theme);
  const makeSelectTheme = (selectTheme: SelectTheme): SelectTheme => ({
    ...selectTheme,
    colors: {
      ...selectTheme.colors,
      primary25: themed(theme, 'primary_light')!,
      primary50: themed(theme, 'primary')!,
      primary75: themed(theme, 'primary')!,
      primary: themed(theme, 'primary')!,
      neutral0: themed(theme, 'white')!,
      neutral5: themed(theme, 'off_white')!,
      neutral10: themed(theme, 'border_white')!,
      neutral20: themed(theme, 'light_gray')!,
      neutral30: themed(theme, 'gray')!,
      neutral40: themed(theme, 'gray')!,
      neutral50: themed(theme, 'gray')!,
      neutral60: themed(theme, 'dark_black')!,
      neutral70: themed(theme, 'border_black')!,
      neutral80: themed(theme, 'off_black')!,
      neutral90: themed(theme, 'black')!,
    }
  })
  const Component = isVirtual ? VirtualSelect : Select;
  return (
    <Component
      isMulti={isMulti}
      value={value}
      {...props}
      components={{
        IndicatorSeparator: () => null,
      }}
      theme={makeSelectTheme}
      styles={{
        option: (base, props) => ({
          ...base,
          color: props.isSelected ? themed(theme, 'primary_highlight')! : themed(theme, 'text_base')!,
        })
      }}
    />
  );
};

export default BTSelect;
