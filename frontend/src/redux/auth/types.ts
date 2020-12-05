import { Action } from 'redux'

export interface UserProfile {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthState {
  loading: boolean;
  userProfile?: UserProfile;
  isLoggedIn: boolean;
}

export const LOG_IN = "LOG_IN"
export const LOG_OUT = "LOG_OUT"

export type AuthAction = 
  | {
      type: typeof LOG_IN
      profile: UserProfile
    }
  | { type: typeof LOG_OUT }
