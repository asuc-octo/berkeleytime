import { Theme } from 'bt/types';
import React, { FC, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/store';

export interface Props {
  light: ReactElement
  dark?: ReactElement
  stanfurd?: ReactElement
}

const Themed: FC<Props> = (props) => {
  const theme = useSelector<ReduxState, Theme>(state => state.common.theme);

  switch (theme) {
    case 'light':
      return props.light
    case 'dark':
      return props.dark ?? props.light
    case 'stanfurd':
      return props.stanfurd ?? props.light
  }
}

export default Themed;