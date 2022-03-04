import {
  OPEN_BANNER,
  CLOSE_BANNER,
  CommonAction,
  ENTER_MOBILE,
  EXIT_MOBILE,
} from "./types";

export const openBanner = (): CommonAction => ({ type: OPEN_BANNER });
export const closeBanner = (): CommonAction => ({ type: CLOSE_BANNER });
export const enterMobile = (): CommonAction => ({ type: ENTER_MOBILE });
export const exitMobile = (): CommonAction => ({ type: EXIT_MOBILE });
