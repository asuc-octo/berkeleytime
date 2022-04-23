import { OPEN_BANNER, CLOSE_BANNER, CommonAction, ENTER_MOBILE, EXIT_MOBILE, OPEN_LANDING_MODAL, CLOSE_LANDING_MODAL } from './types'

export const openBanner = (): CommonAction => ({ type: OPEN_BANNER })
export const closeBanner = (): CommonAction => ({ type: CLOSE_BANNER })
export const openLandingModal = (): CommonAction => ({ type: OPEN_LANDING_MODAL })
export const closeLandingModal = (): CommonAction => ({ type: CLOSE_LANDING_MODAL })
export const enterMobile = (): CommonAction => ({ type: ENTER_MOBILE })
export const exitMobile = (): CommonAction => ({ type: EXIT_MOBILE })
