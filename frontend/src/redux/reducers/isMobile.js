/**
 * Contains single boolean representing whether the viewport
 * is currently mobile (less than 768px)
 *
 * Initially updated by Berkeleytime.jsx, which registers
 * a listener to viewport changes
 */

import { SHOW_MOBILE, HIDE_MOBILE } from '../actionTypes';

const initialState = {
  isMobile: false,
};

export default function mobile(state = initialState, action) {
  switch (action.type) {
  case SHOW_MOBILE: {
    return { isMobile: true };
  }
  case HIDE_MOBILE: {
    return { isMobile: false };
  }
  default:
    return state;
  }
}
