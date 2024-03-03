import {
  getUserRequest,
  signinRequest,
} from '../../utils/api';

import {
  // loginRequest,
  // logoutRequest,
  registerRequest,
  // getUserRequest,
  // updateUserRequest,
} from '../../utils/api';

import {
  AUTH_USER_FAIL,
  AUTH_USER_REQUEST,
  AUTH_USER_SUCCESS,
  GET_USER_FAIL,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  LOGOUT_USER_FAIL,
  LOGOUT_USER_REQUEST,
  LOGOUT_USER_SUCCESS,
  REGISTER_USER_FAIL,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  UPDATE_USER_FAIL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
} from '../constants';
import { AppDispatch, AppThunk } from '../types';
import { TLoginForm, TRegisterData, TUser, TOwnUserData } from '../types/data';
// import { baseUrl } from '../../utils/constants';

export interface IRegisterUserRequestAction {
  type: typeof REGISTER_USER_REQUEST;
}

export interface IRegisterUserSuccessAction {
  type: typeof REGISTER_USER_SUCCESS;
  payload: TRegisterData;
}

export interface IRegisterUserFailAction {
  type: typeof REGISTER_USER_FAIL;
}

/////////
export interface IAuthUserRequestAction {
  type: typeof AUTH_USER_REQUEST;
}

export interface IAuthUserSuccessAction {
  type: typeof AUTH_USER_SUCCESS;
  payload: {
    accessToken: string;
    // refreshToken: string;
    // user: TUser;
  };
}

export interface IAuthUserFailAction {
  type: typeof AUTH_USER_FAIL;
}

export interface IGetUserRequestAction {
  type: typeof GET_USER_REQUEST;
}

export interface IGetUserSuccessAction {
  type: typeof GET_USER_SUCCESS;
  payload: TOwnUserData;
}

export interface IGetUserFailAction {
  type: typeof GET_USER_FAIL;
}

export interface IUpdateUserRequestAction {
  type: typeof UPDATE_USER_REQUEST;
}
export interface IUpdateUserSuccessAction {
  type: typeof UPDATE_USER_SUCCESS;
  payload: {
    user: TUser;
  };
}
export interface IUpdateUserFailAction {
  type: typeof UPDATE_USER_FAIL;
}

export interface ILogoutUserRequestAction {
  type: typeof LOGOUT_USER_REQUEST;
}
export interface ILogoutUserSuccessAction {
  type: typeof LOGOUT_USER_SUCCESS;
}
export interface ILogoutUserFailAction {
  type: typeof LOGOUT_USER_FAIL;
}

export type TUserActions =
  | IRegisterUserRequestAction
  | IRegisterUserSuccessAction
  | IRegisterUserFailAction
  | IAuthUserRequestAction
  | IAuthUserSuccessAction
  | IAuthUserFailAction
  | IGetUserRequestAction
  | IGetUserSuccessAction
  | IGetUserFailAction
  | IUpdateUserRequestAction
  | IUpdateUserSuccessAction
  | IUpdateUserFailAction
  | ILogoutUserRequestAction
  | ILogoutUserSuccessAction
  | ILogoutUserFailAction;

// при аутентификации пользователя с сервера приходят данные
// в том же формате, что и при регистрации нового пользователя
// type TAuthUserData = TRegisterData;

// используется для типизации ответа сервера при получении
// данных пользователя
// type TGetUserData = {
//   user: TUser;
// };

// используется для типизации ответа сервера
// при выходе из личного кабинета
// type TUserLogout = {
//   message: string;
// };

export const registerUserThunk: AppThunk =
  (user: TUser) => (dispatch: AppDispatch) => {
    dispatch({
      type: REGISTER_USER_REQUEST,
    });

    registerRequest(user)
      // .then((result: Response) => checkResponse<TRegisterData>(result))
      // .then(checkSuccess)
      .then((responseBody: TRegisterData) => {
        if (user) {
          dispatch({
            type: REGISTER_USER_SUCCESS,
            payload: responseBody,
          });
        }
      })
      .catch((err: any) => {
        dispatch({
          type: REGISTER_USER_FAIL,
          payload: err,
          isLoading: false,
          hasError: true,
        });
      });
  };

export const authUserThunk: AppThunk =
  (form: TLoginForm) => (dispatch: AppDispatch) => {
    dispatch({
      type: AUTH_USER_REQUEST,
    });

    signinRequest(form)
      // .then((result) => checkResponse<TAuthData>(result))
      // .then(checkSuccess)
      .then((responseBody) => {
        dispatch({
          type: AUTH_USER_SUCCESS,
          payload: {
            accessToken: responseBody.access_token,
          },
        });
      })
      .catch((err) => {
        dispatch({
          type: AUTH_USER_FAIL,
          payload: err,
          isLoading: false,
          hasError: true,
        });
      });
  };

export const getUserDataThunk: AppThunk =
  () => async (dispatch: AppDispatch) => {
    dispatch({
      type: GET_USER_REQUEST,
    });
    // console.log('getUserDataThunk!!!!');
    await getUserRequest()
      .then((responseBody) => {
        // console.log('getUserRequest: ', responseBody);
        dispatch({
          type: GET_USER_SUCCESS,
          payload: responseBody,
          isLoading: false,
          hasError: false,
        });
      })
      .catch((err: any) => {
        console.log('ERRR', err);
        dispatch({
          type: GET_USER_FAIL,
          payload: err,
          isLoading: false,
          hasError: true,
        });
      });
  };
