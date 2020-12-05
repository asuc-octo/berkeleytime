import {
    LOG_IN,
    LOG_OUT,
    AuthAction,
    UserProfile
} from "./types";

export const logIn = (userProfile: UserProfile): AuthAction => ({
  type: LOG_IN,
  profile: userProfile
});

export const logOut = (): AuthAction => ({
  type: LOG_OUT
});
