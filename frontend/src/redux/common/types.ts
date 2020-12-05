import { Action } from 'redux'

export interface CommonState {
  banner: boolean
  mobile: boolean
}

export const OPEN_BANNER = 'OPEN_BANNER'
export const CLOSE_BANNER = 'CLOSE_BANNER'
export const ENTER_MOBILE = 'ENTER_MOBILE'
export const EXIT_MOBILE = 'EXIT_MOBILE'

export type CommonAction = Action<string>
