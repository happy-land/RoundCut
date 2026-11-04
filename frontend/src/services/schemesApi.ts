import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "../utils/constants";
import { TScheme, TSchemeStatus } from "../utils/types";
import { getCookie } from "../utils/cookie";

export const schemesApi = createApi({
  reducerPath: "schemesApi",
  tagTypes: ["Schemes"],
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    /** POST /schemes/from-order/:orderId — сформировать схему из заказа */
    generateScheme: builder.mutation<TScheme, number>({
      query: (orderId) => ({
        url: `/schemes/from-order/${orderId}`,
        method: "POST",
        headers: {
          authorization: `Bearer ${getCookie("accessToken")}`,
        },
      }),
      invalidatesTags: ["Schemes"],
    }),

    /** GET /schemes/:id — документ целиком */
    getScheme: builder.query<TScheme, number>({
      query: (id) => ({
        url: `/schemes/${id}`,
        headers: {
          authorization: `Bearer ${getCookie("accessToken")}`,
        },
      }),
      providesTags: ["Schemes"],
    }),

    /** PATCH /schemes/:id/status — Принято / Выполнено */
    updateSchemeStatus: builder.mutation<
      TScheme,
      { id: number; status: TSchemeStatus }
    >({
      query: ({ id, status }) => ({
        url: `/schemes/${id}/status`,
        method: "PATCH",
        headers: {
          authorization: `Bearer ${getCookie("accessToken")}`,
        },
        body: { status },
      }),
      invalidatesTags: ["Schemes"],
    }),
  }),
});

export const {
  useGenerateSchemeMutation,
  useGetSchemeQuery,
  useUpdateSchemeStatusMutation,
} = schemesApi;
