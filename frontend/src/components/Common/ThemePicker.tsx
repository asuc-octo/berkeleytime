/* eslint-disable jsx-a11y/alt-text */

import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../redux/store';
import { Theme } from 'bt/types';
import { setThemeLight, setThemeDark, setThemeStanfurd } from '../../redux/common/actions';

import stanfurd from 'assets/img/theme/stanfurd.png';

const ThemePicker: FC = () => {
  const currentTheme = useSelector<ReduxState, Theme>(state => state.common.theme);
  const dispatch = useDispatch();

  const className = (theme: string) => (
    `theme ${theme === currentTheme ? 'selected' : ''}`
  );

  return (
    <div className="theme-picker">
      <div className="themes">
        <span className={className('light')} onClick={() => dispatch(setThemeLight())}>🌞</span>
        <span className={className('dark')} onClick={() => dispatch(setThemeDark())}>🌚</span>
        <img src={stanfurd} className={className('stanfurd')} onClick={() => dispatch(setThemeStanfurd())} />
      </div>
    </div>
  );
}

export default ThemePicker;
