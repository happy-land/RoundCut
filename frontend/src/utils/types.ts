export type TUser = {
  email: string | undefined;
  password?: string;
  name: string;
  token?: string;
};

export type TLoginForm = {
  email: string; // email === username (Passport.js)
  password: string;
};

export type TForgotPasswordForm = {
  email: string;
};

export type TResetPasswordForm = {
  password: string;
  passwordRepeat: string;
};

// export type TLoginResponse = {

// };

// export type TRegisterResponse = {

// };

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
  id: number; //
  username: string; //
  about: string; //
  avatar: string; //
  email: string; //
  createdAt: string; //
  updatedAt: string; //
  // isAuth: boolean;
};

// тип описывает строку прайса металлопроката, перед отправкой на сервер,
// созданную на фронте
export type TPriceItem = {
  readonly actualBalance: number;
  readonly unitWeight: number;
  readonly unitPrice: number;
  readonly pricePer1tn: number;
  readonly pricePer5tn: number;
  readonly pricePer15tn: number;
  readonly baseName: string | null;
  readonly name: string;
  readonly size: string;
  readonly surface: string;
  readonly other: string;
  readonly productGroup: string;
  readonly length: number;
  readonly categoryName: string;
};

// тип описывает строку прайса металлопроката, полученную от сервера
export type TPriceItemResponse = {
  readonly id?: number;
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
  readonly catName?: string;
  readonly warehouse?: {
    id: number;
  };
};

export type TPriceItemExtendedResponse = TPriceItemResponse & {
  nameExt: string; // на входе: Круг ст20 3ГП  - на выходе Круг ст20
  sizeNum: number; // 'удаляем мм из поля size, чтобы сортировать как number
  indexOfSecondSpace: number;
  // getIndex: (this: never) => void;
};

export type TCutItem = TPriceItemExtendedResponse & {
  length: number;
  weight: number;
};

export type TBillet = {
  item: TPriceItemExtendedResponse;
  markup: TMarkup;
  cutType: string; // поменять на 'лентопил' 'газ' 'отрезной'
};

// temp
export type TPriceItemTemp = {
  id: string;
  title: string;
};

// используется для типизации ответа сервера
// при получении строк прайса
// GET /users/me
export type TPriceitemsData = {
  data: Array<TPriceItemResponse>;
};

export type TWarehouse = {
  id: number;
  name: string;
  description?: string;
};

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
  // [key: string]: number | string;
};

export type TAdminCut = {
  id: number;
  name: string;
  profile?: string;
  code?: string;
};

export type TGoodsCutItem = {
  name: string;
  warehouse?: string;
  amount: number;
  warehouse_id: number;
  cut_id: number;
};

export type TCutitemWithCut = {
  id: number;
  name: string;
  from: number;
  to: number;
  amount: number;
  warehouse_id: number;
  cut_id: number;
  cut: {
    id: number;
    code?: string; // ← вот что нам нужно
    name: string;
  };
};

export type TAdminCategory = {
  id: number;
  name: string;
  description?: string;
};

/** Данные расчёта заготовок — зеркало BilletCartData из backend DTO */
export type TBilletCartData = {
  cutThickness: number;
  endCut: number;
  workpieces: { length: number; quantity: number }[];
  numCircles: number;
  numCompleteCircles: number;
  wholeCirclesWeight: number;
  /** Цена за тонну целых кругов (с наценкой за малотоннажность), ₽ */
  wholeCirclesPricePerTon: number;
  partWeight: number;
  /** Цена за тонну части (с 12% надбавкой, округлено до 100), ₽ */
  partPricePerTon: number;
  billetGoodsCost: number;
  cuttingCostForBillets: number;
  totalCuts: number;
};

export type TCartItem = {
  id: number;
  priceitemId: number;
  name: string;
  size: string;
  quantity: number;
  weightTons: number;
  pricePerTon: number;
  totalGoodsPrice: number;
  totalCuttingCost: number;
  cuttingDescription: string | null;
  billetData: TBilletCartData | null;
  createdAt: string;
  updatedAt: string;
};

export type TCreateCartItemDto = {
  priceitemId: number;
  name: string;
  size: string;
  quantity: number;
  weightTons: number;
  pricePerTon: number;
  totalGoodsPrice: number;
  totalCuttingCost: number;
  cuttingDescription?: string;
  billetData?: TBilletCartData;
};
