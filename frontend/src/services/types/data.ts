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
  username: string;
  password: string;
}

// используется для типизации ответа сервера
// при регистрации нового пользователя
// POST /signup
export type TRegisterData = {
  username: string;
  email: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  about: string;
  avatar: string;
};

// используется для типизации ответа сервера
// при аутентификации пользователя 
// POST /signin
export type TAuthData = {
  access_token: string;
}

// используется для типизации ответа сервера
// при получении данных пользователя 
// GET /users/me
export type TOwnUserData = {
  id: number;
  username: string;
  about: string;
  avatar: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}


// было в проекте React Burger
// type TRegisterData = {
//   user: TUser;
//   accessToken: string;
//   refreshToken: string;
// };

export type TProfileModal = {
  readonly name: string;
}

// тип описывает строку прайса металлопроката, полученную от сервера
export type TPriceItem = {
  id: string;
  readonly actualBalance: number;
  readonly unitWeight: number;
  readonly unitPrice: number;
  readonly pricePer1tn: number;
  readonly pricePer5tn: number;
  readonly pricePer15tn: number;
  readonly baseName: string;
  readonly name: string;
  readonly size: string;
  readonly surface: string;
  readonly other: string;
  readonly productGroup: string;
  readonly length: number;
}

// используется для типизации ответа сервера
// при получении строк прайса 
// GET /users/me
export type TPriceitemsData = {
  data: Array<TPriceItem>;
}