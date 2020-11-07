import { Action } from 'redux'

/**
 * {    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InNteHUiLCJleHAiOjE2MDIyOTM1NzcsImVtYWlsIjoic214dUBiZXJrZWxleS5lZHUifQ.IFzeQQ452xAI4dtzdoQDNqv54RBP_ZgdB-yJbDtKLvA",    "new_user": false,    "user": {        "id": 1,        "user": {            "email": "smxu@berkeley.edu",            "first_name": "Shuming",            "last_name": "Xu"        },        "major": "Computer something",        "email_class_update": false,        "email_grade_update": false,        "email_enrollment_opening": false,        "email_berkeleytime_update": false,        "saved_classes": []    }}
 */

export interface UserProfile {
  id: number;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
  major: string;
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