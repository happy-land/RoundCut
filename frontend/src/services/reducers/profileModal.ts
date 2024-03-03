import { TProfileModalActions } from '../actions/profileModal';
import { PROFILE_MODAL_CLOSE, PROFILE_MODAL_OPEN } from '../constants';
import { TProfileModal } from '../types/data';


type TProfileModalState = {
  isProfileModalOpened: boolean;
  item: TProfileModal | null;
};

const profileInitialState: TProfileModalState = {
  isProfileModalOpened: false,
  item: null,
};

export const profileModalReducer = (state = profileInitialState, action: TProfileModalActions): TProfileModalState => {
  switch (action.type) {
    case PROFILE_MODAL_OPEN:
      return {
        ...state,
        isProfileModalOpened: true,
        item: action.payload,
      };
    case PROFILE_MODAL_CLOSE:
      return {
        ...state,
        isProfileModalOpened: false,
      }
      default: {
        return state;
      }
  }
}