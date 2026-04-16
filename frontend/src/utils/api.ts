import { baseUrl, remoteUrl } from './constants';
import { getCookie } from './cookie';
import { TOwnUserData, TPriceItem } from './types';

export type TResponse<T> = {
  success: boolean;
} & T;

export const checkResponse = <T>(res: Response) => {
  console.log(res);
  if (res.ok) {
    console.log(res.ok);
  }
  return res.ok
    ? res.json().then((data) => data as TResponse<T>)
    : Promise.reject(res.status);
};

export const checkSuccess = <T>(response: TResponse<T>) => {
  return response.success ? response : Promise.reject('Error data');
}

const headersWithAuthorizeFn = () => ({
  'Content-Type': 'application/json',
  authorization: `Bearer ${getCookie('accessToken')}`,
});

export const getAllUsersRequest = async () => {
  const res = await fetch(`${baseUrl}/users`, {
    method: 'GET',
    headers: headersWithAuthorizeFn(),
  });
  return checkResponse<Array<TOwnUserData>>(res);
}

export const getUserRequest = async () => {
  const res = await fetch(`${baseUrl}/users/me/`, {
    method: 'GET',
    headers: headersWithAuthorizeFn(),
  });
  // console.log('res= ', res);
  return checkResponse<TOwnUserData>(res);
};

export const getPriceitemsRequest = async () => {
  // console.log('->getPriceitemsRequest');
  const res = await fetch(`${baseUrl}/priceitems`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log('RES ======>');
  console.log(res);
  // return checkResponse<TPriceitemsData>(res);
  return checkResponse<TPriceItem[]>(res);
};