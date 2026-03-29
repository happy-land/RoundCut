import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../utils/constants";
import { TOrder } from "../utils/types";
import { getCookie } from "../utils/cookie";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  tagTypes: ["Orders"],
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    /** GET /orders — список заказов текущего пользователя */
    getOrders: builder.query<TOrder[], void>({
      query: () => ({
        url: "/orders",
        headers: {
          authorization: `Bearer ${getCookie("accessToken")}`,
        },
      }),
      providesTags: ["Orders"],
    }),

    /** POST /orders/from-cart — создать заказ из корзины */
    createOrderFromCart: builder.mutation<TOrder, void>({
      query: () => ({
        url: "/orders/from-cart",
        method: "POST",
        headers: {
          authorization: `Bearer ${getCookie("accessToken")}`,
        },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderFromCartMutation,
} = ordersApi;
