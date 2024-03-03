import {
  TAuthData,
  TLoginForm,
  TOwnUserData,
  TPriceitemsData,
  TRegisterData,
  TResponse,
  TUser,
} from '../services/types/data';
import { baseUrl } from './constants';
import { getCookie } from './cookie';

interface CustomResponse extends Response {
  accessToken?: string;
}

// export const checkResponse = <T>(res: Response): Promise<T> => {
//   if (res.ok) {
//     return res.json();
//   } else {
//     const error = res.json();
//     throw new Error(`${error}`);
//   }
// };

export const checkResponse = <T>(res: Response) => {
  console.log('checkResponse: ', res);
  return res.ok
    ? res.json().then((data) => data as TResponse<T>)
    : Promise.reject(res.status);
};

// export const checkSuccess = <T>(response: TResponse<T>) => {
//   console.log(response.success);
//   return response.success ? response : Promise.reject('Error data');
// }

const headersWithAuthorizeFn = () => ({
  'Content-Type': 'application/json',
  authorization: `Bearer ${getCookie('accessToken')}`,
});

export const registerRequest = async (user: TUser) => {
  const res = await fetch(`${baseUrl}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  return checkResponse<TRegisterData>(res);
};

export const signinRequest = async (form: TLoginForm) => {
  console.log(form);
  const res = await fetch(`${baseUrl}/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(form),
  });
  // console.log('res', res);
  return checkResponse<TAuthData>(res);
};

export const getUserRequest = async () => {
  const res = await fetch(`${baseUrl}/users/me/`, {
    method: 'GET',
    headers: headersWithAuthorizeFn(),
  });
  // console.log('res= ', res);
  return checkResponse<TOwnUserData>(res);
};

export const getPriceitemsRequest = async () => {
  const res = await fetch(`${baseUrl}/priceitems`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return checkResponse<TPriceitemsData>(res);
};
