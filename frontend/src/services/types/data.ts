export type TResponse<T> = {
  success: boolean;
} & T;


export type TUser = {
  email: string | undefined;
  password?: string;
  name: string;
  token?: string;
}

export type TLoginForm = {
  email: string;
  password: string;
  name?: string;
  token?: string;
}

// используется для типизации ответа сервера
// при регистрации нового пользователя
export type TRegisterData = {
  username: string;
  email: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  about: string;
  avatar: string;
};

// было в проекте React Burger
// type TRegisterData = {
//   user: TUser;
//   accessToken: string;
//   refreshToken: string;
// };