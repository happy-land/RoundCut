export type TUser = {
  email: string | undefined;
  password?: string;
  name: string;
  token?: string;
};

export type TLoginForm = {
  username: string;
  password: string;
};

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
};

// используется для типизации ответа сервера
// при получении данных пользователя
// GET /users/me
export type TOwnUserData = {
  id: number;//
  username: string;//
  about: string;//
  avatar: string;//
  email: string;//
  createdAt: string;//
  updatedAt: string;//
  // isAuth: boolean;
};

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
};

export type TPriceItemExtended = TPriceItem & {
  nameExt: string; // на входе: Круг ст20 3ГП  - на выходе Круг ст20
  sizeNum: number; // 'удаляем мм из поля size, чтобы сортировать как number
  indexOfSecondSpace: number;
  getIndex: (this: never) => void;
};

export type TCutItem = TPriceItemExtended & {
  length: number;
  weight: number;
}

// temp
export type TPriceItemTemp = {
  id: string;
  title: string;
};

// используется для типизации ответа сервера
// при получении строк прайса
// GET /users/me
export type TPriceitemsData = {
  data: Array<TPriceItem>;
};

export type TWarehouse = {
  id: number;
  name: string;
  description?: string;
}

export type TMarkup = {
  // id: number; // added by postgres
  name: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  warehouseId: number;
}

export type TAdminCut = {
  id: number;
  name: string;
}

export type TGoodsCutItem = {
  title: string;
  warehouse?: string;
  amount: number;
  warehouseId: number;
  cutId: number;
} 