import {
  CommonState,
  CommonAction,
  OPEN_BANNER,
  CLOSE_BANNER,
  ENTER_MOBILE,
  EXIT_MOBILE,
  SET_THEME_LIGHT,
  SET_THEME_DARK,
  SET_THEME_STANFURD
} from './types'

const initialState: CommonState = {
  banner: false,
  mobile: false,
  theme: 'light'
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
    case SET_THEME_LIGHT:
      return {
        ...state,
        theme: 'light'
      }
    case SET_THEME_DARK:
      return {
        ...state,
        theme: 'dark'
      }
    case SET_THEME_STANFURD:
      return {
        ...state,
        theme: 'stanfurd'
      }
    default:
      return state
  }
}