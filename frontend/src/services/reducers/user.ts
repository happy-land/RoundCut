import { deleteCookie, setCookie } from '../../utils/cookie';
import { TUserActions } from '../actions/user';
import {
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_FAIL,
  AUTH_USER_REQUEST,
  AUTH_USER_SUCCESS,
  AUTH_USER_FAIL,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_USER_FAIL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
  LOGOUT_USER_REQUEST,
  LOGOUT_USER_SUCCESS,
  LOGOUT_USER_FAIL,
} from '../constants';

import { TOwnUserData } from '../types/data';

type TUserState = {
  isLoading: boolean;
  hasError: boolean;
  accessToken: string;
  refreshToken: string;
  isAuth: boolean;
} | TOwnUserData;

const userInitialState: TUserState = {
  isLoading: false,
  hasError: false,
  accessToken: '',
  refreshToken: '',
  isAuth: false,
  id: 0,
  username: '',
  about: '',
  avatar: '',
  email: '',
  createdAt: '',
  updatedAt: '',
};

export const userReducer = (state = userInitialState, action: TUserActions) => {
  switch (action.type) {
    case REGISTER_USER_REQUEST: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case REGISTER_USER_SUCCESS: {
      let authToken;
      const res = action.payload;

      return {
        ...state,
        accessToken: authToken,
        isAuth: true,
        user: res,
        isLoading: false,
        hasError: false,
      };
    }
    case REGISTER_USER_FAIL: {
      return {
        ...state,
        isLoading: false,
        hasError: true,
      };
    }
    case AUTH_USER_REQUEST: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case AUTH_USER_SUCCESS: {
      console.log(action.payload);
      // сохраняем accessToken в куке
      setCookie('accessToken', action.payload.accessToken);

      // сохраняем refreshToken в localStorage
      // if (res.refreshToken) {
      //   localStorage.setItem('refreshToken', res.refreshToken);
      // }

      return {
        ...state,
        accessToken: action.payload.accessToken,
        // refreshToken: res.refreshToken,
        isAuth: true,
        isLoading: false,
        hasError: false,
      };
    }
    case AUTH_USER_FAIL: {
      return {
        ...state,
        isAuth: false,
        isLoading: false,
        hasError: true,
      };
    }
    case GET_USER_REQUEST: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case GET_USER_SUCCESS: {
      const res = action.payload;
      // console.log();
      return {
        ...state,
        isAuth: true,
        isLoading: false,
        hasError: false,
        id: res.id,
        username: res.username,
        about: res.about,
        avatar: res.avatar,
        email: res.email,
        createdAt: res.createdAt,
        updatedAt: res.updatedAt,
      };
    }
    case GET_USER_FAIL: {
      return {
        ...state,
        isLoading: false,
        hasError: true,
      };
    }
    case UPDATE_USER_REQUEST: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case UPDATE_USER_SUCCESS: {
      return {
        ...state,
        isAuth: true,
        user: action.payload.user,
        isLoading: false,
        hasError: false,
      };
    }
    case UPDATE_USER_FAIL: {
      return {
        ...state,
        isLoading: false,
        hasError: true,
      };
    }
    case LOGOUT_USER_REQUEST: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case LOGOUT_USER_SUCCESS: {

      deleteCookie('accessToken');
      localStorage.removeItem('refreshToken');

      return {
        ...state,
        isLoading: false,
        isAuth: false,
        user: null
      }
    }
    case LOGOUT_USER_FAIL: {
      return {
        ...state,
        isLoading: false,
        hasError: true,
      };
    }

    default:
      return state;
  }
};
