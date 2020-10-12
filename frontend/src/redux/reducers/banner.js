/**
 * Contains single boolean representing whether the banner is
 * open or not.
 */

import { OPEN_BANNER, CLOSE_BANNER } from '../actionTypes';

const initialState = {
  banner: true,
};

export default function banner(state = initialState, action) {
  switch (action.type) {
  case OPEN_BANNER: {
    return { banner: true };
  }
  case CLOSE_BANNER: {
    return { banner: false };
  }
  default:
    return state;
  }
}
