import { Action } from 'redux'

export interface CommonState {
  banner: boolean
  landingModal: boolean
  mobile: boolean
}

export const OPEN_BANNER = 'OPEN_BANNER'
export const CLOSE_BANNER = 'CLOSE_BANNER'
export const ENTER_MOBILE = 'ENTER_MOBILE'
export const EXIT_MOBILE = 'EXIT_MOBILE'
export const OPEN_LANDING_MODAL = 'OPEN_LANDING_MODAL'
export const CLOSE_LANDING_MODAL = 'CLOSE_LANDING_MODAL'

export type CommonAction = Action<string>