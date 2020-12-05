import {
  AuthState,
  LOG_IN,
  LOG_OUT,
  AuthAction
} from "./types";

const initialState: AuthState = {
  loading: true,
  userProfile: undefined,
  isLoggedIn: false
};

export default function authReducer(
  state = initialState,
  action: AuthAction
): AuthState {
  switch (action.type) {
    case LOG_IN:
      return {
        ...state,
        loading: false,
        userProfile: action.profile,
        isLoggedIn: true
      }
    case LOG_OUT:
      return {
        ...state,
        loading: false,
        userProfile: undefined,
        isLoggedIn: false
      }
    default:
      return state
  }
}
