import { Action } from 'redux'
import { Theme } from 'bt/types'

export interface CommonState {
  banner: boolean
  mobile: boolean
  theme: Theme
}

export const OPEN_BANNER = 'OPEN_BANNER'
export const CLOSE_BANNER = 'CLOSE_BANNER'
export const ENTER_MOBILE = 'ENTER_MOBILE'
export const EXIT_MOBILE = 'EXIT_MOBILE'
export const SET_THEME_LIGHT = 'SET_THEME_LIGHT'
export const SET_THEME_DARK = 'SET_THEME_DARK'
export const SET_THEME_STANFURD = 'SET_THEME_STANFURD'

export type CommonAction = Action<string>