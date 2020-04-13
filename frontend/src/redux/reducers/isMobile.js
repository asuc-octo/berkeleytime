import { SHOW_MOBILE, HIDE_MOBILE} from '../actionTypes';

const initialState = {
  isMobile: false,
}

export default function mobile(state = initialState, action) {
  switch (action.type) {
    case SHOW_MOBILE: {
      return { isMobile: true };
    }
    case HIDE_MOBILE: {
      return { isMobile: false };
    }
    default: {
      return state;
    }
  }
}