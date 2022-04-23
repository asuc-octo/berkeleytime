import {
  CommonState,
  CommonAction,
  OPEN_BANNER,
  CLOSE_BANNER,
  ENTER_MOBILE,
  EXIT_MOBILE,
  OPEN_LANDING_MODAL,
  CLOSE_LANDING_MODAL,
} from './types';

const initialState: CommonState = {
  banner: false,
  landingModal: false,
  mobile: false,
};

export function commonReducer(
  state = initialState,
  action: CommonAction
): CommonState {
  switch (action.type) {
    case OPEN_BANNER:
      return {
        ...state,
        banner: true,
      };
    case CLOSE_BANNER:
      const bannerType = 'sp22recruitment'
      localStorage.setItem('bt-hide-banner', bannerType);
      return {
        ...state,
        banner: false,
      };
    case OPEN_LANDING_MODAL:
      return {
        ...state,
        landingModal: true,
      };
    case CLOSE_LANDING_MODAL:
      const modalType = 'sp22scheduler'
      localStorage.setItem('bt-hide-landing-modal', modalType);
      return {
        ...state,
        landingModal: false,
      };
    case ENTER_MOBILE:
      return {
        ...state,
        mobile: true,
      };
    case EXIT_MOBILE:
      return {
        ...state,
        mobile: false,
      };
    default:
      return state;
  }
}
