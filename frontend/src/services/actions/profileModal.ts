import { PROFILE_MODAL_OPEN, PROFILE_MODAL_CLOSE } from '../constants';
import { TProfileModal } from '../types/data';

export interface IOpenProfileModalAction {
  type: typeof PROFILE_MODAL_OPEN;
  payload: TProfileModal;
}

export interface ICloseProfileModalAction {
  type: typeof PROFILE_MODAL_CLOSE;
}

export type TProfileModalActions =
  | IOpenProfileModalAction
  | ICloseProfileModalAction;

export const openProfileModalAction = (
  profile: TProfileModal,
): IOpenProfileModalAction => ({
  type: PROFILE_MODAL_OPEN,
  payload: {
    ...profile,
  },
});

export const closeProfileModalAction = (): ICloseProfileModalAction => ({
  type: PROFILE_MODAL_CLOSE,
})