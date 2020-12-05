import {
  CommonState,
  CommonAction,
  OPEN_BANNER,
  CLOSE_BANNER,
  ENTER_MOBILE,
  EXIT_MOBILE
} from './types'

const initialState: CommonState = {
  banner: false,
  mobile: false
}

export function commonReducer(
  state = initialState,
  action: CommonAction
): CommonState {
  switch (action.type) {
    case OPEN_BANNER:
      return {
        ...state,
        banner: true
      }
    case CLOSE_BANNER:
      return {
        ...state,
        banner: false
      }
    case ENTER_MOBILE:
      return {
        ...state,
        mobile: true
      }
    case EXIT_MOBILE:
      return {
        ...state,
        mobile: false
      }
    default:
      return state
  }
}
