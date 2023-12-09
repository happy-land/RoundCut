import { TResponse, TUser } from '../services/types/data';
import { baseUrl } from './constants';
import { getCookie } from './cookie';
import { user1 } from './mockData';

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
  return res.ok ? res.json().then(data => data as TResponse<T>) : Promise.reject(res.status);
};

export const checkSuccess = <T>(response: TResponse<T>) => {
  return response.success ? response : Promise.reject('Error data');
}

export const registerRequest = (user: TUser): Promise<CustomResponse> => {
  return fetch(`${baseUrl}/signup`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
};

export const getUserRequest = async (): Promise<CustomResponse> => {
  return await fetch(`${baseUrl}/auth/user`, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getCookie('accessToken'),
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  });
};