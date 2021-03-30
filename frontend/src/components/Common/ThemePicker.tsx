/* eslint-disable jsx-a11y/alt-text */

import React, { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../redux/store';
import { Theme } from 'bt/types';
import { setThemeLight, setThemeDark, setThemeStanfurd } from '../../redux/common/actions';

import stanfurdLogo from 'assets/img/theme/stanfurd.png';

const ThemePicker: FC = () => {
  const dispatch = useDispatch();

  const light = () => {
    localStorage.setItem('theme', 'light');
    document.body.setAttribute('class', 'bt-theme-light-body');
    dispatch(setThemeLight());
  }

  const dark = () => {
    localStorage.setItem('theme', 'dark');
    document.body.setAttribute('class', 'bt-theme-dark-body');
    dispatch(setThemeDark());
  }

  const stanfurd = () => {
    localStorage.setItem('theme', 'stanfurd');
    document.body.setAttribute('class', 'bt-theme-stanfurd-body');
    dispatch(setThemeStanfurd());
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') ?? 'light';
    switch (storedTheme) {
      case 'light':
        light();
        break;
      case 'dark':
        dark();
        break;
      case 'stanfurd':
        stanfurd();
        break;
    }

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (ev) => {
      if (ev.matches) {
        light()
      }
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (ev) => {
      if (ev.matches) {
        dark()
      }
    });
  }, []);

  const currentTheme = useSelector<ReduxState, Theme>(state => state.common.theme);
  const themeClassName = (theme: string) => (
    `theme ${theme === currentTheme ? 'selected' : ''}`
  );

  return (
    <div className="theme-picker">
      <div className="themes">
        <span
          className={themeClassName('light')}
          onClick={light}
        >
          🌞
        </span>
        <span
          className={themeClassName('dark')}
          onClick={dark}>
          🌚
        </span>
        <img
          src={stanfurdLogo}
          className={themeClassName('stanfurd')}
          onClick={stanfurd}
        />
      </div>
    </div>
  );
}

export default ThemePicker;
