import {
  CommonAction,
  OPEN_BANNER,
  CLOSE_BANNER,
  ENTER_MOBILE,
  EXIT_MOBILE,
  SET_THEME_LIGHT,
  SET_THEME_DARK,
  SET_THEME_STANFURD
} from './types'

export const openBanner = (): CommonAction => ({ type: OPEN_BANNER })
export const closeBanner = (): CommonAction => ({ type: CLOSE_BANNER })
export const enterMobile = (): CommonAction => ({ type: ENTER_MOBILE })
export const exitMobile = (): CommonAction => ({ type: EXIT_MOBILE })
export const setThemeLight = (): CommonAction => ({ type: SET_THEME_LIGHT })
export const setThemeDark = (): CommonAction => ({ type: SET_THEME_DARK })
export const setThemeStanfurd = (): CommonAction => ({ type: SET_THEME_STANFURD })
