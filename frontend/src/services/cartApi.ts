import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../utils/constants";
import { TCartItem, TCreateCartItemDto } from "../utils/types";
import { getCookie } from "../utils/cookie";

export type TSendGuestOrderDto = {
  email: string;
  name: string;
  items: TCreateCartItemDto[];
};

export const cartApi = createApi({
  reducerPath: "cartApi",
  tagTypes: ["Cart"],
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getCart: builder.query<TCartItem[], void>({
      query: () => ({
        url: "/cart",
        headers: {
          authorization: `Bearer ${getCookie("accessToken")}`,
        },
      }),
      providesTags: ["Cart"],
    }),

    addCartItem: builder.mutation<TCartItem, TCreateCartItemDto>({
      query: (body) => ({
        url: "/cart",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    removeCartItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `/cart/${id}`,
        method: "DELETE",
        headers: {
          authorization: `Bearer ${getCookie("accessToken")}`,
        },
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<void, void>({
      query: () => ({
        url: "/cart/all",
        method: "DELETE",
        headers: {
          authorization: `Bearer ${getCookie("accessToken")}`,
        },
      }),
      invalidatesTags: ["Cart"],
    }),

    sendToSelf: builder.mutation<void, void>({
      query: () => ({
        url: "/cart/send-to-self",
        method: "POST",
        headers: {
          authorization: `Bearer ${getCookie("accessToken")}`,
        },
      }),
    }),

    sendGuestOrder: builder.mutation<void, TSendGuestOrderDto>({
      query: (body) => ({
        url: "/cart/send-guest",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useSendToSelfMutation,
  useSendGuestOrderMutation,
} = cartApi;
